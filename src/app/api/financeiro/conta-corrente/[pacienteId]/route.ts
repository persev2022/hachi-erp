import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Patient's financial statement (conta corrente)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pacienteId: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "FINANCEIRO", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { pacienteId } = await params;

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, deletedAt: null },
      select: { id: true, nome: true, mensalidadeValor: true, diaVencimento: true },
    });

    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    // Get all movements for this patient
    const movimentacoes = await prisma.movimentacaoFinanceira.findMany({
      where: { pacienteId },
      orderBy: { dataVencimento: "desc" },
    });

    // Calculate totals
    const totalCobrado = movimentacoes
      .filter((m) => m.tipo === "RECEITA")
      .reduce((sum, m) => sum + m.valor, 0);

    const totalPago = movimentacoes
      .filter((m) => m.tipo === "RECEITA" && m.status === "PAGO")
      .reduce((sum, m) => sum + m.valor, 0);

    const totalPendente = movimentacoes
      .filter((m) => m.tipo === "RECEITA" && ["PENDENTE", "ATRASADO"].includes(m.status))
      .reduce((sum, m) => sum + m.valor, 0);

    const totalAtrasado = movimentacoes
      .filter((m) => m.tipo === "RECEITA" && m.status === "ATRASADO")
      .reduce((sum, m) => sum + m.valor, 0);

    return NextResponse.json({
      success: true,
      data: {
        paciente,
        movimentacoes,
        resumo: {
          totalCobrado,
          totalPago,
          totalPendente,
          totalAtrasado,
          saldo: totalCobrado - totalPago,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/financeiro/conta-corrente/[pacienteId] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar conta corrente" }, { status: 500 });
  }
}
