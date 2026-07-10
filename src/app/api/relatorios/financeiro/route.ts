import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Financial report (DRE-like)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "FINANCEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    const { searchParams } = new URL(req.url);
    const meses = parseInt(searchParams.get("meses") || "6");

    const now = new Date();
    const results = [];

    // Build tenant filter
    const tenantFilter: any = tenantId ? { tenantId } : {};

    for (let i = meses - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [receitas, despesas, receitasPagas] = await Promise.all([
        prisma.movimentacaoFinanceira.aggregate({
          where: { tipo: "RECEITA", dataVencimento: { gte: start, lte: end }, ...tenantFilter },
          _sum: { valor: true },
          _count: true,
        }),
        prisma.movimentacaoFinanceira.aggregate({
          where: { tipo: "DESPESA", dataVencimento: { gte: start, lte: end }, ...tenantFilter },
          _sum: { valor: true },
          _count: true,
        }),
        prisma.movimentacaoFinanceira.aggregate({
          where: { tipo: "RECEITA", status: "PAGO", dataPagamento: { gte: start, lte: end }, ...tenantFilter },
          _sum: { valor: true },
        }),
      ]);

      const receitaTotal = receitas._sum.valor || 0;
      const despesaTotal = despesas._sum.valor || 0;

      results.push({
        periodo: start.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        mes: start.getMonth() + 1,
        ano: start.getFullYear(),
        receitas: receitaTotal,
        despesas: despesaTotal,
        receitasRecebidas: receitasPagas._sum.valor || 0,
        resultado: receitaTotal - despesaTotal,
        qtdReceitas: receitas._count,
        qtdDespesas: despesas._count,
      });
    }

    // Totals
    const totalReceitas = results.reduce((s, r) => s + r.receitas, 0);
    const totalDespesas = results.reduce((s, r) => s + r.despesas, 0);

    // Inadimplência
    const inadimplencia = await prisma.movimentacaoFinanceira.aggregate({
      where: { tipo: "RECEITA", status: "ATRASADO", ...tenantFilter },
      _sum: { valor: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        periodos: results,
        resumo: {
          totalReceitas,
          totalDespesas,
          resultado: totalReceitas - totalDespesas,
          inadimplencia: inadimplencia._sum.valor || 0,
          qtdInadimplentes: inadimplencia._count,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/relatorios/financeiro error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
