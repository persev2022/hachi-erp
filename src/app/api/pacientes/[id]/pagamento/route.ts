import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const pagamentoSchema = z.object({
  valor: z.number().positive("Valor deve ser positivo"),
  descricao: z.string().optional(),
  formaPagamento: z.string().optional(),
  mesReferencia: z.string().optional(),
});

/**
 * POST /api/pacientes/[id]/pagamento
 * Register a manual payment for a patient (mensalidade).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = pagamentoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Verify patient
    const paciente = await prisma.paciente.findFirst({
      where: { id, deletedAt: null, ...(session.tenantId ? { tenantId: session.tenantId } : {}) },
      select: { id: true, nome: true, tenantId: true },
    });
    if (!paciente) return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });

    const { valor, descricao, formaPagamento, mesReferencia } = parsed.data;
    const now = new Date();
    const desc = descricao || `Mensalidade ${mesReferencia || now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;

    const movimentacao = await prisma.movimentacaoFinanceira.create({
      data: {
        pacienteId: id,
        tipo: "RECEITA",
        categoria: "MENSALIDADE",
        descricao: desc,
        valor,
        dataVencimento: now,
        dataPagamento: now,
        status: "PAGO",
        formaPagamento: formaPagamento || "Pix",
        tenantId: session.tenantId || null,
      },
    });

    await logAudit(session.userId, "PAYMENT", "MovimentacaoFinanceira", movimentacao.id, {
      pacienteId: id,
      valor,
      descricao: desc,
    });

    return NextResponse.json({ success: true, data: movimentacao, message: `Pagamento de R$ ${valor.toFixed(2)} registrado para ${paciente.nome}` });
  } catch (error) {
    console.error("POST /api/pacientes/[id]/pagamento error:", error);
    return NextResponse.json({ success: false, error: "Erro ao registrar pagamento" }, { status: 500 });
  }
}
