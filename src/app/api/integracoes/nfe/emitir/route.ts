import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { emitirNfse } from "@/lib/integrations/nfe/client";

const emitirSchema = z.object({
  pacienteId: z.string().uuid(),
  descricao: z.string().min(5),
  valor: z.number().positive(),
});

// POST: Emit NFS-e
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "FINANCEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = emitirSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

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

    let nfseResult;
    try {
      nfseResult = await emitirNfse({
        tomadorCpfCnpj: cpf,
        tomadorNome: nome,
        tomadorEmail: responsavel?.email || paciente.email || undefined,
        descricao: parsed.data.descricao,
        valor: parsed.data.valor,
      });
    } catch (error: any) {
      console.error("NF-e emit error:", error?.response?.data || error.message);
      return NextResponse.json(
        { success: false, error: "Erro ao emitir NFS-e. Verifique as credenciais." },
        { status: 502 }
      );
    }

    await logAudit(session.userId, "NFE_EMIT", "Documento", nfseResult.id, {
      pacienteId: parsed.data.pacienteId,
      valor: parsed.data.valor,
      numero: nfseResult.numero,
    });

    return NextResponse.json({ success: true, data: nfseResult }, { status: 201 });
  } catch (error) {
    console.error("POST /api/integracoes/nfe/emitir error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
