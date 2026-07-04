import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { criarCobranca } from "@/lib/integrations/pix/client";

const cobrancaSchema = z.object({
  pacienteId: z.string().uuid(),
  valor: z.number().positive(),
  descricao: z.string().optional(),
});

// POST: Create Pix charge
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "COORDENADOR", "FINANCEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = cobrancaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get patient + responsible
    const paciente = await prisma.paciente.findUnique({
      where: { id: parsed.data.pacienteId, deletedAt: null },
      include: { responsaveis: { where: { isFinanceiro: true }, take: 1 } },
    });

    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    const responsavel = paciente.responsaveis[0];
    const cpf = responsavel?.cpf || paciente.cpf;
    const nome = responsavel?.nome || paciente.nome;

    // Create Pix charge
    let pixResult;
    try {
      pixResult = await criarCobranca({
        valor: parsed.data.valor,
        cpf,
        nome,
        descricao: parsed.data.descricao || `Pagamento - ${paciente.nome}`,
      });
    } catch (error: any) {
      console.error("Pix error:", error?.response?.data || error.message);
      return NextResponse.json(
        { success: false, error: "Erro ao gerar cobrança Pix. Verifique as credenciais." },
        { status: 502 }
      );
    }

    // Create financial movement linked to this charge
    await prisma.movimentacaoFinanceira.create({
      data: {
        pacienteId: parsed.data.pacienteId,
        tipo: "RECEITA",
        categoria: "MENSALIDADE",
        descricao: parsed.data.descricao || "Cobrança Pix",
        valor: parsed.data.valor,
        dataVencimento: new Date(Date.now() + 3600000), // 1h expiry
        formaPagamento: "Pix",
        pixTxId: pixResult.txid,
      },
    });

    await logAudit(session.userId, "PIX_CHARGE", "MovimentacaoFinanceira", pixResult.txid, {
      pacienteId: parsed.data.pacienteId,
      valor: parsed.data.valor,
    });

    return NextResponse.json({
      success: true,
      data: {
        txid: pixResult.txid,
        qrcode: pixResult.qrcode,
        imagemQrcode: pixResult.imagemQrcode,
        pixCopiaECola: pixResult.pixCopiaECola,
        status: pixResult.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/integracoes/pix/cobranca error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
