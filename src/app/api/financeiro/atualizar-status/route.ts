import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * POST /api/financeiro/atualizar-status
 * Automatically marks PENDENTE mensalidades as ATRASADO if past due date.
 * Should be called periodically (cron) or on page load.
 * 
 * Also provides a summary of what was updated.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: { updated: 0 } });

    const now = new Date();

    // Find all PENDENTE receitas past due date for this tenant
    const atrasados = await prisma.movimentacaoFinanceira.updateMany({
      where: {
        tenantId,
        tipo: "RECEITA",
        status: "PENDENTE",
        dataVencimento: { lt: now },
      },
      data: {
        status: "ATRASADO",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        updated: atrasados.count,
        message: atrasados.count > 0
          ? `${atrasados.count} mensalidade(s) marcada(s) como ATRASADO.`
          : "Nenhuma mensalidade pendente vencida.",
      },
    });
  } catch (error) {
    console.error("POST /api/financeiro/atualizar-status error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
