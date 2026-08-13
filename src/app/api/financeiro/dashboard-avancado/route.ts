import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET: Advanced financial dashboard data
 * Calculates previsto (expected) vs realizado (actual) for each month,
 * based on active patients' mensalidade values and actual payments.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "FINANCEIRO", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) {
      return NextResponse.json({ success: true, data: getEmptyData() });
    }

    const { searchParams } = new URL(req.url);
    const meses = Math.min(12, Math.max(1, parseInt(searchParams.get("meses") || "12")));

    const now = new Date();
    const tf = { tenantId };

    // ═══════════════════════════════════════════════════════════
    // 1. PREVISTO vs REALIZADO por mês
    // ═══════════════════════════════════════════════════════════
    const periodos = [];

    for (let i = meses - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      // Previsto: sum of mensalidadeValor for patients who were active during this month
      // A patient is "active in month" if: dataAdmissao <= end of month AND (status=ATIVO OR dataAlta >= start of month)
      const pacientesNoMes = await prisma.paciente.findMany({
        where: {
          ...tf,
          deletedAt: null,
          dataAdmissao: { lte: end },
          OR: [
            { status: "ATIVO", dataAlta: null },
            { dataAlta: { gte: start } },
          ],
        },
        select: { id: true, nome: true, mensalidadeValor: true, matriculaValor: true, dataAdmissao: true },
      });

      const previsto = pacientesNoMes.reduce((sum, p) => sum + (p.mensalidadeValor || 0), 0);

      // Realizado: actual RECEITA payments received in this month
      const realizado = await prisma.movimentacaoFinanceira.aggregate({
        where: {
          ...tf,
          tipo: "RECEITA",
          status: "PAGO",
          dataPagamento: { gte: start, lte: end },
        },
        _sum: { valor: true },
      });

      // Receitas pendentes/atrasadas deste mês
      const pendente = await prisma.movimentacaoFinanceira.aggregate({
        where: {
          ...tf,
          tipo: "RECEITA",
          status: { in: ["PENDENTE", "ATRASADO"] },
          dataVencimento: { gte: start, lte: end },
        },
        _sum: { valor: true },
        _count: true,
      });

      // Despesas do mês
      const despesas = await prisma.movimentacaoFinanceira.aggregate({
        where: {
          ...tf,
          tipo: "DESPESA",
          dataVencimento: { gte: start, lte: end },
        },
        _sum: { valor: true },
      });

      const despesasPagas = await prisma.movimentacaoFinanceira.aggregate({
        where: {
          ...tf,
          tipo: "DESPESA",
          status: "PAGO",
          dataPagamento: { gte: start, lte: end },
        },
        _sum: { valor: true },
      });

      const realizadoVal = realizado._sum.valor || 0;
      const despesasVal = despesas._sum.valor || 0;

      periodos.push({
        periodo: start.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        mes: start.getMonth() + 1,
        ano: start.getFullYear(),
        previsto,
        realizado: realizadoVal,
        taxaRecebimento: previsto > 0 ? Math.round((realizadoVal / previsto) * 100) : 0,
        pendente: pendente._sum.valor || 0,
        qtdPendentes: pendente._count,
        despesas: despesasVal,
        despesasPagas: despesasPagas._sum.valor || 0,
        resultado: realizadoVal - despesasVal,
        pacientesAtivos: pacientesNoMes.length,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // 2. RESUMO GERAL (mês atual)
    // ═══════════════════════════════════════════════════════════
    const mesAtual = periodos[periodos.length - 1];
    const mesAnterior = periodos.length >= 2 ? periodos[periodos.length - 2] : null;

    // ═══════════════════════════════════════════════════════════
    // 3. INADIMPLÊNCIA detalhada
    // ═══════════════════════════════════════════════════════════
    const inadimplentes = await prisma.movimentacaoFinanceira.findMany({
      where: {
        ...tf,
        tipo: "RECEITA",
        status: "ATRASADO",
      },
      include: {
        paciente: { select: { id: true, nome: true } },
      },
      orderBy: { dataVencimento: "asc" },
      take: 20,
    });

    const totalInadimplencia = await prisma.movimentacaoFinanceira.aggregate({
      where: { ...tf, tipo: "RECEITA", status: "ATRASADO" },
      _sum: { valor: true },
      _count: true,
    });

    // ═══════════════════════════════════════════════════════════
    // 4. RECEITA POR CATEGORIA
    // ═══════════════════════════════════════════════════════════
    const firstOfYear = new Date(now.getFullYear(), 0, 1);
    const receitaPorCategoria = await prisma.movimentacaoFinanceira.groupBy({
      by: ["categoria"],
      where: { ...tf, tipo: "RECEITA", dataVencimento: { gte: firstOfYear } },
      _sum: { valor: true },
      _count: true,
    });

    const despesaPorCategoria = await prisma.movimentacaoFinanceira.groupBy({
      by: ["categoria"],
      where: { ...tf, tipo: "DESPESA", dataVencimento: { gte: firstOfYear } },
      _sum: { valor: true },
      _count: true,
    });

    // ═══════════════════════════════════════════════════════════
    // 5. TOP DEVEDORES
    // ═══════════════════════════════════════════════════════════
    const devedoresByPaciente = await prisma.movimentacaoFinanceira.groupBy({
      by: ["pacienteId"],
      where: { ...tf, tipo: "RECEITA", status: "ATRASADO", pacienteId: { not: null } },
      _sum: { valor: true },
      _count: true,
      orderBy: { _sum: { valor: "desc" } },
      take: 10,
    });

    // Get patient names for devedores
    const devedorIds = devedoresByPaciente.map((d) => d.pacienteId!).filter(Boolean);
    const devedorPacientes = await prisma.paciente.findMany({
      where: { id: { in: devedorIds } },
      select: { id: true, nome: true },
    });
    const devedorMap = Object.fromEntries(devedorPacientes.map((p) => [p.id, p.nome]));

    const topDevedores = devedoresByPaciente.map((d) => ({
      pacienteId: d.pacienteId,
      nome: devedorMap[d.pacienteId!] || "Desconhecido",
      totalDevido: d._sum.valor || 0,
      qtdParcelas: d._count,
    }));

    // ═══════════════════════════════════════════════════════════
    // 6. PROJEÇÃO próximos 3 meses
    // ═══════════════════════════════════════════════════════════
    const pacientesAtivosAgora = await prisma.paciente.findMany({
      where: { ...tf, status: "ATIVO", deletedAt: null },
      select: { mensalidadeValor: true },
    });

    const receitaProjetadaMensal = pacientesAtivosAgora.reduce((s, p) => s + (p.mensalidadeValor || 0), 0);

    // Average expense of last 3 months
    const ultimosTresMeses = periodos.slice(-3);
    const mediaDespesas = ultimosTresMeses.length > 0
      ? ultimosTresMeses.reduce((s, p) => s + p.despesas, 0) / ultimosTresMeses.length
      : 0;

    // Average taxa de recebimento dos últimos 3 meses para projeção realista
    const mediaTaxaRecebimento = ultimosTresMeses.length > 0
      ? ultimosTresMeses.reduce((s, p) => s + p.taxaRecebimento, 0) / ultimosTresMeses.length
      : 80;

    const projecao = [];
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      projecao.push({
        periodo: futureDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        receitaPrevista: receitaProjetadaMensal,
        receitaProjetada: Math.round(receitaProjetadaMensal * (mediaTaxaRecebimento / 100)),
        despesaProjetada: Math.round(mediaDespesas),
        resultadoProjetado: Math.round(receitaProjetadaMensal * (mediaTaxaRecebimento / 100) - mediaDespesas),
      });
    }

    // ═══════════════════════════════════════════════════════════
    // 7. KPIs AVANÇADOS
    // ═══════════════════════════════════════════════════════════
    const totalPrevistoAno = periodos.reduce((s, p) => s + p.previsto, 0);
    const totalRealizadoAno = periodos.reduce((s, p) => s + p.realizado, 0);
    const totalDespesasAno = periodos.reduce((s, p) => s + p.despesas, 0);

    // Variação mês a mês
    const variacaoReceita = mesAnterior && mesAnterior.realizado > 0
      ? Math.round(((mesAtual.realizado - mesAnterior.realizado) / mesAnterior.realizado) * 100)
      : 0;

    const variacaoDespesa = mesAnterior && mesAnterior.despesas > 0
      ? Math.round(((mesAtual.despesas - mesAnterior.despesas) / mesAnterior.despesas) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        periodos,
        projecao,
        resumoMesAtual: {
          previsto: mesAtual.previsto,
          realizado: mesAtual.realizado,
          taxaRecebimento: mesAtual.taxaRecebimento,
          pendente: mesAtual.pendente,
          despesas: mesAtual.despesas,
          resultado: mesAtual.resultado,
          pacientesAtivos: mesAtual.pacientesAtivos,
          variacaoReceita,
          variacaoDespesa,
        },
        inadimplencia: {
          total: totalInadimplencia._sum.valor || 0,
          quantidade: totalInadimplencia._count,
          topDevedores,
          detalhes: inadimplentes.map((i) => ({
            id: i.id,
            paciente: i.paciente?.nome || "—",
            valor: i.valor,
            vencimento: i.dataVencimento,
            descricao: i.descricao,
          })),
        },
        categorias: {
          receitas: receitaPorCategoria.map((c) => ({
            categoria: c.categoria,
            total: c._sum.valor || 0,
            quantidade: c._count,
          })),
          despesas: despesaPorCategoria.map((c) => ({
            categoria: c.categoria,
            total: c._sum.valor || 0,
            quantidade: c._count,
          })),
        },
        kpis: {
          receitaProjetadaMensal,
          mediaTaxaRecebimento: Math.round(mediaTaxaRecebimento),
          totalPrevistoAno,
          totalRealizadoAno,
          totalDespesasAno,
          margemOperacional: totalRealizadoAno > 0
            ? Math.round(((totalRealizadoAno - totalDespesasAno) / totalRealizadoAno) * 100)
            : 0,
          ticketMedio: pacientesAtivosAgora.length > 0
            ? Math.round(receitaProjetadaMensal / pacientesAtivosAgora.length)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/financeiro/dashboard-avancado error:", error);
    return NextResponse.json({ success: false, error: "Erro ao carregar dashboard financeiro" }, { status: 500 });
  }
}

function getEmptyData() {
  return {
    periodos: [],
    projecao: [],
    resumoMesAtual: { previsto: 0, realizado: 0, taxaRecebimento: 0, pendente: 0, despesas: 0, resultado: 0, pacientesAtivos: 0, variacaoReceita: 0, variacaoDespesa: 0 },
    inadimplencia: { total: 0, quantidade: 0, topDevedores: [], detalhes: [] },
    categorias: { receitas: [], despesas: [] },
    kpis: { receitaProjetadaMensal: 0, mediaTaxaRecebimento: 0, totalPrevistoAno: 0, totalRealizadoAno: 0, totalDespesasAno: 0, margemOperacional: 0, ticketMedio: 0 },
  };
}
