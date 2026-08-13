import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/financeiro/analise-profunda
 * Enterprise-level financial analysis:
 * - Top payers (credores/pagadores) with frequency and total
 * - Cost centers automatically classified
 * - Cash flow patterns (daily/weekly)
 * - Revenue concentration risk
 * - Expense breakdown by vendor
 * - Payment method distribution
 * - Seasonality detection
 * - Financial health score
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

    // ═══ 1. IDENTIFY PAYERS & CREDITORS from descriptions ═══
    const pagadores: Record<string, { total: number; count: number; lastDate: string }> = {};
    const credores: Record<string, { total: number; count: number; lastDate: string; categoria: string }> = {};

    for (const m of movs) {
      const desc = m.descricao;
      // Extract name from PIX descriptions
      let nome = "";
      if (desc.includes("PIX")) {
        // Pattern: "RECEBIMENTO PIX 12345678900 NOME SOBRENOME" or "PAGAMENTO PIX 12345 NOME"
        const parts = desc.replace(/RECEBIMENTO PIX|PAGAMENTO PIX/gi, "").trim();
        // Remove CPF/CNPJ (number sequences at start)
        nome = parts.replace(/^\d{11,14}\s*/, "").replace(/^PIX_\w+\s*/, "").trim();
        if (nome.length < 3) nome = parts.trim();
      } else if (desc.includes("COMPRAS NACIONAIS")) {
        nome = desc.replace("COMPRAS NACIONAIS", "").trim().split(" ").slice(0, 2).join(" ");
      } else if (desc.includes("DEBITO CONVENIOS")) {
        nome = desc.replace(/DEBITO CONVENIOS \d+/, "").trim().split(" ").slice(0, 3).join(" ");
      } else if (desc.includes("LIQUIDACAO")) {
        nome = "Parcela/Financiamento";
      } else {
        nome = desc.slice(0, 30);
      }

      if (!nome || nome.length < 2) continue;
      nome = nome.slice(0, 40);
      const dateStr = m.dataVencimento.toISOString().split("T")[0];

      if (m.tipo === "RECEITA") {
        if (!pagadores[nome]) pagadores[nome] = { total: 0, count: 0, lastDate: dateStr };
        pagadores[nome].total += m.valor;
        pagadores[nome].count++;
        pagadores[nome].lastDate = dateStr;
      } else {
        if (!credores[nome]) credores[nome] = { total: 0, count: 0, lastDate: dateStr, categoria: m.categoria };
        credores[nome].total += m.valor;
        credores[nome].count++;
        credores[nome].lastDate = dateStr;
      }
    }

    // Sort by total
    const topPagadores = Object.entries(pagadores)
      .map(([nome, d]) => ({ nome, ...d }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    const topCredores = Object.entries(credores)
      .map(([nome, d]) => ({ nome, ...d }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    // ═══ 2. COST CENTERS ═══
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
      const d = m.descricao.toUpperCase();
      let centro = "Outros";
      if (d.includes("KOMPRAO") || d.includes("SUPERMERCADO") || d.includes("MERCADO") || d.includes("BUFFON") || d.includes("MANENTTI") || m.categoria === "ALIMENTACAO") {
        centro = "Alimentação & Suprimentos";
      } else if (d.includes("POSTO") || d.includes("AUTOPISTA") || d.includes("SEM PARAR") || d.includes("VIA FACIL") || m.categoria === "TRANSPORTE") {
        centro = "Transporte & Combustível";
      } else if (d.includes("LIQUIDACAO") || d.includes("JUROS") || d.includes("IOF") || d.includes("PARCELA")) {
        centro = "Financeiro (Parcelas/Juros)";
      } else if (d.includes("PAGAMENTO PIX") && !d.includes("GAS") && !d.includes("ELETRO")) {
        centro = "Pessoal (Pagamentos)";
      } else if (d.includes("VIVO") || d.includes("NETFLIX") || d.includes("JOBWAY")) {
        centro = "Telecomunicações";
      } else if (d.includes("MAPFRE") || d.includes("VIDA SEGURADORA") || d.includes("CONSORCIO")) {
        centro = "Seguros & Convênios";
      } else if (d.includes("TARIFA") || d.includes("CUSTAS") || d.includes("CESTA") || d.includes("PROTESTO")) {
        centro = "Taxas & Tarifas Bancárias";
      } else if (d.includes("ELETRO") || d.includes("MABEL") || d.includes("MULTI")) {
        centro = "Serviços & Manutenção";
      }
      centrosCusto[centro].total += m.valor;
      centrosCusto[centro].count++;
    }

    // ═══ 3. CASH FLOW BY WEEK ═══
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

    // ═══ 4. PAYMENT METHOD DISTRIBUTION ═══
    const metodos: Record<string, { total: number; count: number }> = {};
    for (const m of movs) {
      const met = m.formaPagamento || "Não identificado";
      if (!metodos[met]) metodos[met] = { total: 0, count: 0 };
      metodos[met].total += m.valor;
      metodos[met].count++;
    }

    // ═══ 5. REVENUE CONCENTRATION RISK ═══
    const totalReceita = movs.filter((m) => m.tipo === "RECEITA").reduce((s, m) => s + m.valor, 0);
    const top3Receita = topPagadores.slice(0, 3).reduce((s, p) => s + p.total, 0);
    const concentracaoRisco = totalReceita > 0 ? Math.round((top3Receita / totalReceita) * 100) : 0;

    // ═══ 6. FINANCIAL HEALTH SCORE (0-100) ═══
    const totalDespesa = movs.filter((m) => m.tipo === "DESPESA").reduce((s, m) => s + m.valor, 0);
    const margem = totalReceita > 0 ? (totalReceita - totalDespesa) / totalReceita : 0;
    const diversificacao = topPagadores.length;
    let healthScore = 50;
    if (margem > 0.3) healthScore += 20; else if (margem > 0.1) healthScore += 10; else if (margem < 0) healthScore -= 20;
    if (concentracaoRisco < 30) healthScore += 15; else if (concentracaoRisco > 60) healthScore -= 10;
    if (diversificacao > 10) healthScore += 15; else if (diversificacao > 5) healthScore += 5;
    healthScore = Math.max(0, Math.min(100, healthScore));

    // ═══ 7. SUMMARY METRICS ═══
    const diasComDados = new Set(movs.map((m) => m.dataVencimento.toISOString().split("T")[0])).size;
    const mediaReceitaDia = diasComDados > 0 ? totalReceita / diasComDados : 0;
    const mediaDespesaDia = diasComDados > 0 ? totalDespesa / diasComDados : 0;

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
        },
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
