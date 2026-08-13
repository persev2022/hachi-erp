import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/financeiro/analise-profunda
 * ENTERPRISE CFO-LEVEL FINANCIAL INTELLIGENCE
 * 
 * Modules:
 * 1.  KPIs & Health Score
 * 2.  DRE (Income Statement)
 * 3.  Burn Rate & Runway
 * 4.  Ponto de Equilíbrio (Break-even)
 * 5.  Comparativo Mensal
 * 6.  Anomalias (outlier detection)
 * 7.  Transações Recorrentes
 * 8.  Top Pagadores/Credores
 * 9.  Centros de Custo
 * 10. Métodos de Pagamento
 * 11. Fluxo Semanal
 * 12. Aging de Recebíveis (30/60/90+)
 * 13. Índices Financeiros (Liquidez, EBITDA)
 * 14. Projeção de Receita (regressão + sazonalidade)
 * 15. Fluxo de Caixa Projetado (próximos 3 meses)
 * 16. Análise de Cohort (retenção de pagadores)
 * 17. Score de Inadimplência por Pagador
 * 18. Sugestões de Corte de Custos
 * 19. Alertas Preditivos
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "FINANCEIRO", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: null });

    const movs = await prisma.movimentacaoFinanceira.findMany({
      where: { tenantId },
      orderBy: { dataVencimento: "desc" },
    });

    if (movs.length === 0) return NextResponse.json({ success: true, data: null });

    // Also fetch patient data for deeper analysis
    const pacientes = await prisma.paciente.findMany({
      where: { tenantId },
      include: { responsaveis: true },
    });

    const now = new Date();

    // ═══════════════════════════════════════════════════════════
    // 1. IDENTIFY PAYERS & CREDITORS
    // ═══════════════════════════════════════════════════════════
    const pagadores: Record<string, { total: number; count: number; lastDate: string; firstDate: string; valores: number[] }> = {};
    const credores: Record<string, { total: number; count: number; lastDate: string; categoria: string }> = {};

    for (const m of movs) {
      const desc = m.descricao;
      let nome = extractName(desc);
      if (!nome || nome.length < 2) continue;
      nome = nome.slice(0, 40);
      const dateStr = m.dataVencimento.toISOString().split("T")[0];

      if (m.tipo === "RECEITA") {
        if (!pagadores[nome]) pagadores[nome] = { total: 0, count: 0, lastDate: dateStr, firstDate: dateStr, valores: [] };
        pagadores[nome].total += m.valor;
        pagadores[nome].count++;
        pagadores[nome].lastDate = dateStr > pagadores[nome].lastDate ? dateStr : pagadores[nome].lastDate;
        pagadores[nome].firstDate = dateStr < pagadores[nome].firstDate ? dateStr : pagadores[nome].firstDate;
        pagadores[nome].valores.push(m.valor);
      } else {
        if (!credores[nome]) credores[nome] = { total: 0, count: 0, lastDate: dateStr, categoria: m.categoria };
        credores[nome].total += m.valor;
        credores[nome].count++;
        credores[nome].lastDate = dateStr;
      }
    }

    const topPagadores = Object.entries(pagadores)
      .map(([nome, d]) => ({ nome, ...d, ticketMedio: d.total / d.count }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    const topCredores = Object.entries(credores)
      .map(([nome, d]) => ({ nome, ...d }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    // ═══════════════════════════════════════════════════════════
    // 2. COST CENTERS
    // ═══════════════════════════════════════════════════════════
    const centrosCusto: Record<string, { total: number; count: number }> = {
      "Alimentação & Suprimentos": { total: 0, count: 0 },
      "Transporte & Combustível": { total: 0, count: 0 },
      "Financeiro (Parcelas/Juros)": { total: 0, count: 0 },
      "Pessoal (Pagamentos)": { total: 0, count: 0 },
      "Telecomunicações": { total: 0, count: 0 },
      "Seguros & Convênios": { total: 0, count: 0 },
      "Taxas & Tarifas Bancárias": { total: 0, count: 0 },
      "Serviços & Manutenção": { total: 0, count: 0 },
      "Outros": { total: 0, count: 0 },
    };

    for (const m of movs.filter((m) => m.tipo === "DESPESA")) {
      const centro = classifyCostCenter(m.descricao, m.categoria);
      centrosCusto[centro].total += m.valor;
      centrosCusto[centro].count++;
    }

    // ═══════════════════════════════════════════════════════════
    // 3. WEEKLY CASH FLOW
    // ═══════════════════════════════════════════════════════════
    const weeklyFlow: Record<string, { receitas: number; despesas: number }> = {};
    for (const m of movs) {
      const date = new Date(m.dataVencimento);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split("T")[0];
      if (!weeklyFlow[key]) weeklyFlow[key] = { receitas: 0, despesas: 0 };
      if (m.tipo === "RECEITA") weeklyFlow[key].receitas += m.valor;
      else weeklyFlow[key].despesas += m.valor;
    }

    const fluxoSemanal = Object.entries(weeklyFlow)
      .map(([semana, d]) => ({ semana, ...d, resultado: d.receitas - d.despesas }))
      .sort((a, b) => a.semana.localeCompare(b.semana));

    // ═══════════════════════════════════════════════════════════
    // 4. PAYMENT METHODS
    // ═══════════════════════════════════════════════════════════
    const metodos: Record<string, { total: number; count: number }> = {};
    for (const m of movs) {
      const met = m.formaPagamento || "Não identificado";
      if (!metodos[met]) metodos[met] = { total: 0, count: 0 };
      metodos[met].total += m.valor;
      metodos[met].count++;
    }

    // ═══════════════════════════════════════════════════════════
    // 5. CORE METRICS
    // ═══════════════════════════════════════════════════════════
    const totalReceita = movs.filter((m) => m.tipo === "RECEITA").reduce((s, m) => s + m.valor, 0);
    const totalDespesa = movs.filter((m) => m.tipo === "DESPESA").reduce((s, m) => s + m.valor, 0);
    const top3Receita = topPagadores.slice(0, 3).reduce((s, p) => s + p.total, 0);
    const concentracaoRisco = totalReceita > 0 ? Math.round((top3Receita / totalReceita) * 100) : 0;
    const margem = totalReceita > 0 ? (totalReceita - totalDespesa) / totalReceita : 0;
    const diasComDados = new Set(movs.map((m) => m.dataVencimento.toISOString().split("T")[0])).size;
    const mediaReceitaDia = diasComDados > 0 ? totalReceita / diasComDados : 0;
    const mediaDespesaDia = diasComDados > 0 ? totalDespesa / diasComDados : 0;

    // Health Score
    let healthScore = 50;
    if (margem > 0.3) healthScore += 20; else if (margem > 0.1) healthScore += 10; else if (margem < 0) healthScore -= 20;
    if (concentracaoRisco < 30) healthScore += 15; else if (concentracaoRisco > 60) healthScore -= 10;
    if (topPagadores.length > 10) healthScore += 15; else if (topPagadores.length > 5) healthScore += 5;
    healthScore = Math.max(0, Math.min(100, healthScore));

    // ═══════════════════════════════════════════════════════════
    // 6. DRE (Income Statement)
    // ═══════════════════════════════════════════════════════════
    const receitaBruta = totalReceita;
    const deducoesReceita = movs.filter(m => m.tipo === "RECEITA" && m.descricao.toUpperCase().includes("DEVOLUC")).reduce((s, m) => s + m.valor, 0);
    const receitaLiquida = receitaBruta - deducoesReceita;
    const custosDiretos = movs.filter(m => m.tipo === "DESPESA" && (m.categoria === "ALIMENTACAO" || m.categoria === "MEDICAMENTO" || m.categoria === "LAVANDERIA")).reduce((s, m) => s + m.valor, 0);
    const lucroBruto = receitaLiquida - custosDiretos;
    const despesasOperacionais = totalDespesa - custosDiretos;
    const lucroOperacional = lucroBruto - despesasOperacionais;
    const despesasFinanceiras = movs.filter(m => m.descricao.toUpperCase().match(/JUROS|IOF|TARIFA|CUSTAS|CESTA/)).reduce((s, m) => s + m.valor, 0);
    const lucroLiquido = lucroOperacional - despesasFinanceiras;
    // EBITDA approximation (no depreciation/amortization tracked)
    const ebitda = lucroOperacional + despesasFinanceiras;

    // ═══════════════════════════════════════════════════════════
    // 7. BURN RATE & RUNWAY
    // ═══════════════════════════════════════════════════════════
    const mesesAnalisados = diasComDados > 0 ? diasComDados / 30 : 1;
    const burnRateMensal = totalDespesa / mesesAnalisados;
    const receitaMensal = totalReceita / mesesAnalisados;
    const burnLiquido = burnRateMensal - receitaMensal;
    const saldoAtual = totalReceita - totalDespesa;
    const runway = burnLiquido > 0 ? Math.max(0, Math.round((saldoAtual / burnLiquido) * 30)) : 999;

    // ═══════════════════════════════════════════════════════════
    // 8. PONTO DE EQUILÍBRIO (Break-even)
    // ═══════════════════════════════════════════════════════════
    const custoFixoMensal = movs.filter(m => m.tipo === "DESPESA" && m.descricao.toUpperCase().match(/VIVO|NETFLIX|SEGURADORA|CONSORCIO|SEM PARAR|PARCELA|LIQUIDACAO/)).reduce((s, m) => s + m.valor, 0) / mesesAnalisados;
    const custoVariavelPorPaciente = custosDiretos / (topPagadores.length || 1) / mesesAnalisados;
    const ticketMedio = topPagadores.length > 0 ? totalReceita / topPagadores.length / mesesAnalisados : 0;
    const pontoEquilibrio = ticketMedio > custoVariavelPorPaciente ? Math.ceil(custoFixoMensal / (ticketMedio - custoVariavelPorPaciente)) : 0;

    // ═══════════════════════════════════════════════════════════
    // 9. COMPARATIVO MENSAL
    // ═══════════════════════════════════════════════════════════
    const porMes: Record<string, { receitas: number; despesas: number; countRec: number; countDesp: number }> = {};
    for (const m of movs) {
      const mes = m.dataVencimento.toISOString().slice(0, 7);
      if (!porMes[mes]) porMes[mes] = { receitas: 0, despesas: 0, countRec: 0, countDesp: 0 };
      if (m.tipo === "RECEITA") { porMes[mes].receitas += m.valor; porMes[mes].countRec++; }
      else { porMes[mes].despesas += m.valor; porMes[mes].countDesp++; }
    }
    const comparativoMensal = Object.entries(porMes)
      .map(([mes, d]) => ({
        mes,
        ...d,
        resultado: d.receitas - d.despesas,
        margem: d.receitas > 0 ? Math.round(((d.receitas - d.despesas) / d.receitas) * 100) : 0,
        transacoes: d.countRec + d.countDesp,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    // ═══════════════════════════════════════════════════════════
    // 10. ANOMALIAS (Outlier Detection - Z-score based)
    // ═══════════════════════════════════════════════════════════
    const despesas = movs.filter(m => m.tipo === "DESPESA");
    const mediaDesp = despesas.reduce((s, m) => s + m.valor, 0) / (despesas.length || 1);
    const stdDevDesp = Math.sqrt(despesas.reduce((s, m) => s + Math.pow(m.valor - mediaDesp, 2), 0) / (despesas.length || 1));
    const anomalias: { data: string; descricao: string; valor: number; motivo: string; zscore: number }[] = [];
    for (const m of despesas) {
      const zscore = stdDevDesp > 0 ? (m.valor - mediaDesp) / stdDevDesp : 0;
      if (zscore > 2) {
        anomalias.push({
          data: m.dataVencimento.toISOString().split("T")[0],
          descricao: m.descricao.slice(0, 50),
          valor: m.valor,
          motivo: `Z-score ${zscore.toFixed(1)} (${(m.valor / mediaDesp).toFixed(1)}x a média)`,
          zscore,
        });
      }
    }
    anomalias.sort((a, b) => b.zscore - a.zscore);

    // ═══════════════════════════════════════════════════════════
    // 11. TRANSAÇÕES RECORRENTES
    // ═══════════════════════════════════════════════════════════
    const descFrequency: Record<string, { count: number; total: number; tipo: string }> = {};
    for (const m of movs) {
      const key = m.descricao.slice(0, 30).toUpperCase();
      if (!descFrequency[key]) descFrequency[key] = { count: 0, total: 0, tipo: m.tipo };
      descFrequency[key].count++;
      descFrequency[key].total += m.valor;
    }
    const recorrentes = Object.entries(descFrequency)
      .filter(([_, d]) => d.count >= 3)
      .map(([desc, d]) => ({ descricao: desc, frequencia: d.count, total: d.total, mediaPorOcorrencia: d.total / d.count, tipo: d.tipo }))
      .sort((a, b) => b.frequencia - a.frequencia)
      .slice(0, 15);

    // ═══════════════════════════════════════════════════════════
    // 12. AGING DE RECEBÍVEIS (30/60/90+ dias)
    // ═══════════════════════════════════════════════════════════
    const recebiveisPendentes = movs.filter(m => m.tipo === "RECEITA" && m.status === "PENDENTE");
    const recebiveisAtrasados = movs.filter(m => m.tipo === "RECEITA" && m.status === "ATRASADO");
    const todosVencidos = [...recebiveisPendentes, ...recebiveisAtrasados].filter(m => new Date(m.dataVencimento) < now);

    const aging = {
      corrente: { valor: 0, count: 0 }, // not yet due
      vencido30: { valor: 0, count: 0 },
      vencido60: { valor: 0, count: 0 },
      vencido90: { valor: 0, count: 0 },
      vencido90plus: { valor: 0, count: 0 },
      totalVencido: 0,
    };

    const naoVencidos = [...recebiveisPendentes].filter(m => new Date(m.dataVencimento) >= now);
    aging.corrente = { valor: naoVencidos.reduce((s, m) => s + m.valor, 0), count: naoVencidos.length };

    for (const m of todosVencidos) {
      const diasAtraso = Math.floor((now.getTime() - new Date(m.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
      if (diasAtraso <= 30) { aging.vencido30.valor += m.valor; aging.vencido30.count++; }
      else if (diasAtraso <= 60) { aging.vencido60.valor += m.valor; aging.vencido60.count++; }
      else if (diasAtraso <= 90) { aging.vencido90.valor += m.valor; aging.vencido90.count++; }
      else { aging.vencido90plus.valor += m.valor; aging.vencido90plus.count++; }
    }
    aging.totalVencido = aging.vencido30.valor + aging.vencido60.valor + aging.vencido90.valor + aging.vencido90plus.valor;

    // ═══════════════════════════════════════════════════════════
    // 13. ÍNDICES FINANCEIROS
    // ═══════════════════════════════════════════════════════════
    const recebiveisTotal = movs.filter(m => m.tipo === "RECEITA" && (m.status === "PENDENTE" || m.status === "ATRASADO")).reduce((s, m) => s + m.valor, 0);
    const pagaveisTotal = movs.filter(m => m.tipo === "DESPESA" && m.status === "PENDENTE").reduce((s, m) => s + m.valor, 0);
    const liquidezCorrente = pagaveisTotal > 0 ? recebiveisTotal / pagaveisTotal : 99;
    const margemEbitda = receitaLiquida > 0 ? (ebitda / receitaLiquida) * 100 : 0;
    const roa = totalReceita > 0 ? (lucroLiquido / totalReceita) * 100 : 0; // Return on Assets (approximation)
    const cicloFinanceiro = diasComDados > 0 ? Math.round((recebiveisTotal / (totalReceita / diasComDados))) : 0; // Days Sales Outstanding

    const indices = {
      liquidezCorrente: Math.round(liquidezCorrente * 100) / 100,
      margemEbitda: Math.round(margemEbitda),
      ebitda: Math.round(ebitda),
      roa: Math.round(roa),
      cicloFinanceiro, // DSO in days
      recebiveisTotal: Math.round(recebiveisTotal),
      pagaveisTotal: Math.round(pagaveisTotal),
    };

    // ═══════════════════════════════════════════════════════════
    // 14. PROJEÇÃO DE RECEITA (Linear Regression + Seasonality)
    // ═══════════════════════════════════════════════════════════
    const mesesOrdenados = comparativoMensal.map((m, i) => ({ x: i, y: m.receitas }));
    const n = mesesOrdenados.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (const p of mesesOrdenados) {
      sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x;
    }
    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
    const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

    // Project next 3 months
    const projecaoReceita = [];
    for (let i = 1; i <= 3; i++) {
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + i);
      const mesStr = nextMonth.toISOString().slice(0, 7);
      const projectedValue = Math.max(0, intercept + slope * (n + i - 1));
      // Add seasonality factor (compare same month previous year if available)
      const sameMonthPrev = comparativoMensal.find(m => m.mes.endsWith(mesStr.slice(5)));
      const seasonFactor = sameMonthPrev && comparativoMensal.length > 0
        ? sameMonthPrev.receitas / (sumY / n || 1)
        : 1;
      const adjusted = projectedValue * Math.min(1.5, Math.max(0.5, seasonFactor));
      projecaoReceita.push({
        mes: mesStr,
        otimista: Math.round(adjusted * 1.15),
        realista: Math.round(adjusted),
        pessimista: Math.round(adjusted * 0.8),
      });
    }

    // ═══════════════════════════════════════════════════════════
    // 15. FLUXO DE CAIXA PROJETADO (próximos 3 meses)
    // ═══════════════════════════════════════════════════════════
    const despesaMensal = totalDespesa / mesesAnalisados;
    const fluxoProjetado = projecaoReceita.map(p => ({
      mes: p.mes,
      receitaProjetada: p.realista,
      despesaProjetada: Math.round(despesaMensal),
      saldoProjetado: p.realista - Math.round(despesaMensal),
    }));

    // ═══════════════════════════════════════════════════════════
    // 16. ANÁLISE DE COHORT (Retenção de Pagadores)
    // ═══════════════════════════════════════════════════════════
    // Group payers by their first payment month
    const cohorts: Record<string, { total: number; retained: number; churn: number }> = {};
    const lastMonthStr = comparativoMensal.length > 0 ? comparativoMensal[comparativoMensal.length - 1].mes : "";

    for (const [_, d] of Object.entries(pagadores)) {
      const firstMonth = d.firstDate.slice(0, 7);
      if (!cohorts[firstMonth]) cohorts[firstMonth] = { total: 0, retained: 0, churn: 0 };
      cohorts[firstMonth].total++;
      // If their last payment is in the last month analyzed, they're retained
      if (d.lastDate.slice(0, 7) >= lastMonthStr || d.count > 1) {
        cohorts[firstMonth].retained++;
      } else {
        cohorts[firstMonth].churn++;
      }
    }

    const cohortAnalysis = Object.entries(cohorts)
      .map(([mes, d]) => ({
        mes,
        totalPagadores: d.total,
        retidos: d.retained,
        churned: d.churn,
        taxaRetencao: d.total > 0 ? Math.round((d.retained / d.total) * 100) : 0,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    // ═══════════════════════════════════════════════════════════
    // 17. SCORE DE INADIMPLÊNCIA POR PAGADOR
    // ═══════════════════════════════════════════════════════════
    // Cross-reference patients with payment status
    const inadimplencia: { nome: string; score: number; motivo: string; valor: number; diasAtraso: number }[] = [];

    // From movimentações with status ATRASADO linked to patients
    const atrasados = movs.filter(m => m.tipo === "RECEITA" && (m.status === "ATRASADO" || (m.status === "PENDENTE" && new Date(m.dataVencimento) < now)));
    const atrasadosByPaciente: Record<string, { total: number; count: number; maxDias: number }> = {};

    for (const m of atrasados) {
      const key = m.pacienteId || m.descricao.slice(0, 30);
      if (!atrasadosByPaciente[key]) atrasadosByPaciente[key] = { total: 0, count: 0, maxDias: 0 };
      atrasadosByPaciente[key].total += m.valor;
      atrasadosByPaciente[key].count++;
      const dias = Math.floor((now.getTime() - new Date(m.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
      atrasadosByPaciente[key].maxDias = Math.max(atrasadosByPaciente[key].maxDias, dias);
    }

    for (const [pacId, d] of Object.entries(atrasadosByPaciente)) {
      const pac = pacientes.find(p => p.id === pacId);
      const nome = pac ? pac.nome : pacId.slice(0, 30);
      // Score: 0 = bom, 100 = péssimo
      let score = 0;
      if (d.maxDias > 90) score += 40; else if (d.maxDias > 60) score += 30; else if (d.maxDias > 30) score += 20; else score += 10;
      if (d.count > 3) score += 30; else if (d.count > 1) score += 15;
      if (d.total > 5000) score += 30; else if (d.total > 2000) score += 15;
      score = Math.min(100, score);

      let motivo = "";
      if (d.maxDias > 90) motivo = "Atraso crítico (90+ dias)";
      else if (d.maxDias > 60) motivo = "Atraso severo (60+ dias)";
      else if (d.maxDias > 30) motivo = "Atraso moderado (30+ dias)";
      else motivo = "Atraso leve";
      if (d.count > 3) motivo += ` · ${d.count} parcelas`;

      inadimplencia.push({ nome, score, motivo, valor: d.total, diasAtraso: d.maxDias });
    }
    inadimplencia.sort((a, b) => b.score - a.score);

    // ═══════════════════════════════════════════════════════════
    // 18. SUGESTÕES DE CORTE DE CUSTOS
    // ═══════════════════════════════════════════════════════════
    const sugestoes: { area: string; economia: number; impacto: string; descricao: string }[] = [];

    // Find cost centers growing faster than revenue
    const centrosArr = Object.entries(centrosCusto).filter(([_, d]) => d.total > 0).sort((a, b) => b[1].total - a[1].total);
    for (const [nome, d] of centrosArr) {
      const pctDespesa = (d.total / totalDespesa) * 100;
      if (pctDespesa > 25) {
        sugestoes.push({
          area: nome,
          economia: Math.round(d.total * 0.1),
          impacto: "alto",
          descricao: `Representa ${pctDespesa.toFixed(0)}% das despesas. Renegociar contratos pode economizar ~10%.`,
        });
      } else if (pctDespesa > 15 && d.count > 10) {
        sugestoes.push({
          area: nome,
          economia: Math.round(d.total * 0.05),
          impacto: "médio",
          descricao: `${d.count} transações. Consolidar fornecedores pode reduzir custos.`,
        });
      }
    }

    // Check for high-frequency small transactions (operational inefficiency)
    const smallFreqTx = recorrentes.filter(r => r.tipo === "DESPESA" && r.frequencia > 5 && r.mediaPorOcorrencia < 100);
    if (smallFreqTx.length > 0) {
      sugestoes.push({
        area: "Micro-transações",
        economia: Math.round(smallFreqTx.reduce((s, t) => s + t.total * 0.2, 0)),
        impacto: "baixo",
        descricao: `${smallFreqTx.length} despesas recorrentes de baixo valor. Consolidar em compras maiores.`,
      });
    }

    // Tarifa bancária alert
    const tarifas = centrosCusto["Taxas & Tarifas Bancárias"];
    if (tarifas && tarifas.total > 500) {
      sugestoes.push({
        area: "Tarifas Bancárias",
        economia: Math.round(tarifas.total * 0.4),
        impacto: "médio",
        descricao: `${fmt(tarifas.total)} em tarifas. Migrar para conta digital pode economizar até 40%.`,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // 19. ALERTAS PREDITIVOS
    // ═══════════════════════════════════════════════════════════
    const alertas: { tipo: string; severidade: string; titulo: string; descricao: string }[] = [];

    // Cash crunch prediction
    if (burnLiquido > 0 && runway < 180) {
      alertas.push({
        tipo: "cashflow",
        severidade: runway < 60 ? "critico" : "alto",
        titulo: "Projeção de Caixa Negativo",
        descricao: `Com burn rate atual, o caixa acaba em ${Math.round(runway / 30)} meses. Aumente receita ou reduza despesas.`,
      });
    }

    // Revenue concentration
    if (concentracaoRisco > 60) {
      alertas.push({
        tipo: "concentracao",
        severidade: "alto",
        titulo: "Dependência de Poucos Pagadores",
        descricao: `Top 3 pagadores = ${concentracaoRisco}% da receita. Perda de 1 pagador pode causar crise.`,
      });
    }

    // Aging receivables
    if (aging.totalVencido > receitaMensal * 0.5) {
      alertas.push({
        tipo: "inadimplencia",
        severidade: "alto",
        titulo: "Inadimplência Elevada",
        descricao: `${fmt(aging.totalVencido)} vencido (${Math.round((aging.totalVencido / receitaMensal) * 100)}% da receita mensal). Ação de cobrança urgente.`,
      });
    }

    // Trend declining
    if (comparativoMensal.length >= 2) {
      const last = comparativoMensal[comparativoMensal.length - 1];
      const prev = comparativoMensal[comparativoMensal.length - 2];
      if (last.receitas < prev.receitas * 0.8) {
        alertas.push({
          tipo: "tendencia",
          severidade: "medio",
          titulo: "Queda de Receita",
          descricao: `Receita caiu ${Math.round(((prev.receitas - last.receitas) / prev.receitas) * 100)}% vs mês anterior. Investigate causas.`,
        });
      }
    }

    // Break-even alert
    const pacAtivos = pacientes.filter(p => p.status === "ATIVO").length;
    if (pontoEquilibrio > 0 && pacAtivos < pontoEquilibrio) {
      alertas.push({
        tipo: "breakeven",
        severidade: "medio",
        titulo: "Abaixo do Ponto de Equilíbrio",
        descricao: `${pacAtivos} pacientes ativos vs ${pontoEquilibrio} necessários. Déficit de ${pontoEquilibrio - pacAtivos} vagas.`,
      });
    }

    // Anomaly trend
    if (anomalias.length > 5) {
      alertas.push({
        tipo: "anomalias",
        severidade: "medio",
        titulo: "Muitas Transações Anômalas",
        descricao: `${anomalias.length} despesas fora do padrão. Pode indicar descontrole operacional ou fraude.`,
      });
    }

    alertas.sort((a, b) => {
      const sev = { critico: 0, alto: 1, medio: 2, baixo: 3 };
      return (sev[a.severidade as keyof typeof sev] || 3) - (sev[b.severidade as keyof typeof sev] || 3);
    });

    // ═══════════════════════════════════════════════════════════
    // RESPONSE
    // ═══════════════════════════════════════════════════════════
    return NextResponse.json({
      success: true,
      data: {
        resumo: {
          totalReceitas: totalReceita,
          totalDespesas: totalDespesa,
          resultado: totalReceita - totalDespesa,
          margem: Math.round(margem * 100),
          transacoes: movs.length,
          diasAnalisados: diasComDados,
          mediaReceitaDia: Math.round(mediaReceitaDia),
          mediaDespesaDia: Math.round(mediaDespesaDia),
          healthScore,
          concentracaoRisco,
          pacientesAtivos: pacAtivos,
        },
        dre: {
          receitaBruta, deducoesReceita, receitaLiquida,
          custosDiretos, lucroBruto,
          despesasOperacionais, lucroOperacional,
          despesasFinanceiras, lucroLiquido,
          ebitda,
          margemBruta: receitaLiquida > 0 ? Math.round((lucroBruto / receitaLiquida) * 100) : 0,
          margemOperacional: receitaLiquida > 0 ? Math.round((lucroOperacional / receitaLiquida) * 100) : 0,
          margemLiquida: receitaLiquida > 0 ? Math.round((lucroLiquido / receitaLiquida) * 100) : 0,
          margemEbitda: receitaLiquida > 0 ? Math.round((ebitda / receitaLiquida) * 100) : 0,
        },
        burnRate: {
          mensal: Math.round(burnRateMensal),
          receitaMensal: Math.round(receitaMensal),
          burnLiquido: Math.round(burnLiquido),
          runwayDias: runway,
          runwayMeses: Math.round(runway / 30),
        },
        pontoEquilibrio: {
          pacientesNecessarios: pontoEquilibrio,
          pacientesAtivos: pacAtivos,
          custoFixoMensal: Math.round(custoFixoMensal),
          custoVariavelPorPaciente: Math.round(custoVariavelPorPaciente),
          ticketMedio: Math.round(ticketMedio),
          deficit: Math.max(0, pontoEquilibrio - pacAtivos),
        },
        indices,
        aging,
        projecaoReceita,
        fluxoProjetado,
        cohortAnalysis,
        inadimplencia: inadimplencia.slice(0, 15),
        sugestoes,
        alertas,
        comparativoMensal,
        anomalias: anomalias.slice(0, 15),
        recorrentes,
        topPagadores,
        topCredores,
        centrosCusto: Object.entries(centrosCusto)
          .map(([nome, d]) => ({ nome, ...d }))
          .filter((c) => c.total > 0)
          .sort((a, b) => b.total - a.total),
        fluxoSemanal,
        metodosPagamento: Object.entries(metodos)
          .map(([nome, d]) => ({ nome, ...d }))
          .sort((a, b) => b.total - a.total),
      },
    });
  } catch (error) {
    console.error("GET /api/financeiro/analise-profunda error:", error);
    return NextResponse.json({ success: false, error: "Erro na análise" }, { status: 500 });
  }
}

// ═══ HELPER FUNCTIONS ═══

function extractName(desc: string): string {
  if (desc.includes("PIX")) {
    const parts = desc.replace(/RECEBIMENTO PIX|PAGAMENTO PIX/gi, "").trim();
    const nome = parts.replace(/^\d{11,14}\s*/, "").replace(/^PIX_\w+\s*/, "").trim();
    return nome.length < 3 ? parts.trim() : nome;
  } else if (desc.includes("COMPRAS NACIONAIS")) {
    return desc.replace("COMPRAS NACIONAIS", "").trim().split(" ").slice(0, 2).join(" ");
  } else if (desc.includes("DEBITO CONVENIOS")) {
    return desc.replace(/DEBITO CONVENIOS \d+/, "").trim().split(" ").slice(0, 3).join(" ");
  } else if (desc.includes("LIQUIDACAO")) {
    return "Parcela/Financiamento";
  }
  return desc.slice(0, 30);
}

function classifyCostCenter(descricao: string, categoria: string): string {
  const d = descricao.toUpperCase();
  if (d.includes("KOMPRAO") || d.includes("SUPERMERCADO") || d.includes("MERCADO") || d.includes("BUFFON") || d.includes("MANENTTI") || categoria === "ALIMENTACAO") {
    return "Alimentação & Suprimentos";
  } else if (d.includes("POSTO") || d.includes("AUTOPISTA") || d.includes("SEM PARAR") || d.includes("VIA FACIL") || categoria === "TRANSPORTE") {
    return "Transporte & Combustível";
  } else if (d.includes("LIQUIDACAO") || d.includes("JUROS") || d.includes("IOF") || d.includes("PARCELA")) {
    return "Financeiro (Parcelas/Juros)";
  } else if (d.includes("PAGAMENTO PIX") && !d.includes("GAS") && !d.includes("ELETRO")) {
    return "Pessoal (Pagamentos)";
  } else if (d.includes("VIVO") || d.includes("NETFLIX") || d.includes("JOBWAY")) {
    return "Telecomunicações";
  } else if (d.includes("MAPFRE") || d.includes("VIDA SEGURADORA") || d.includes("CONSORCIO")) {
    return "Seguros & Convênios";
  } else if (d.includes("TARIFA") || d.includes("CUSTAS") || d.includes("CESTA") || d.includes("PROTESTO")) {
    return "Taxas & Tarifas Bancárias";
  } else if (d.includes("ELETRO") || d.includes("MABEL") || d.includes("MULTI")) {
    return "Serviços & Manutenção";
  }
  return "Outros";
}

function fmt(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
