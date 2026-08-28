import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { financialReasoning, isAvailable } from "@/lib/ai/nvidia";

/**
 * POST /api/financeiro/ia-analise
 * Real-time AI financial analysis. Aggregates ALL financial data + cross-references
 * with operational data (patients, rooms, occupancy) and feeds it to the NVIDIA
 * reasoning model to surface insights a human might miss.
 *
 * Also supports a natural-language question via body { pergunta: string }.
 * Falls back to a rule-based analysis if NVIDIA is not configured.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "FINANCEIRO", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: { insights: [], available: false } });

    const body = await req.json().catch(() => ({}));
    const pergunta: string | undefined = body.pergunta;

    // ═══ Aggregate comprehensive financial context ═══
    const now = new Date();
    const movs = await prisma.movimentacaoFinanceira.findMany({
      where: { tenantId },
      select: { tipo: true, categoria: true, descricao: true, valor: true, dataVencimento: true, status: true, pacienteId: true },
    });

    const pacientes = await prisma.paciente.findMany({
      where: { tenantId, deletedAt: null },
      select: { status: true, mensalidadeValor: true },
    });

    const quartos = await prisma.quarto.findMany({ where: { tenantId }, select: { capacidade: true } });

    // Monthly aggregation
    const porMes: Record<string, { rec: number; desp: number }> = {};
    for (const m of movs) {
      const key = m.dataVencimento.toISOString().slice(0, 7);
      if (!porMes[key]) porMes[key] = { rec: 0, desp: 0 };
      if (m.tipo === "RECEITA") porMes[key].rec += m.valor;
      else porMes[key].desp += m.valor;
    }
    const meses = Object.keys(porMes).sort();
    const serieMensal = meses.map(mo => ({ mes: mo, receita: Math.round(porMes[mo].rec), despesa: Math.round(porMes[mo].desp), resultado: Math.round(porMes[mo].rec - porMes[mo].desp) }));

    // Cost centers
    const custosPorCategoria: Record<string, number> = {};
    for (const m of movs.filter(m => m.tipo === "DESPESA")) {
      custosPorCategoria[m.categoria] = (custosPorCategoria[m.categoria] || 0) + m.valor;
    }

    const totalRec = movs.filter(m => m.tipo === "RECEITA").reduce((s, m) => s + m.valor, 0);
    const totalDesp = movs.filter(m => m.tipo === "DESPESA").reduce((s, m) => s + m.valor, 0);
    const ativos = pacientes.filter(p => p.status === "ATIVO").length;
    const capacidade = quartos.reduce((s, q) => s + q.capacidade, 0);
    const previstoMensal = pacientes.filter(p => p.status === "ATIVO").reduce((s, p) => s + (p.mensalidadeValor || 0), 0);
    const semMensalidade = pacientes.filter(p => p.status === "ATIVO" && (!p.mensalidadeValor || p.mensalidadeValor === 0)).length;

    // Build context for the AI
    const contexto = `
DADOS FINANCEIROS DA CT PERSEV (centro terapêutico de dependência química):

PERÍODO: ${meses[0]} a ${meses[meses.length - 1]} (${meses.length} meses)
TOTAL RECEITAS: R$ ${totalRec.toFixed(2)}
TOTAL DESPESAS: R$ ${totalDesp.toFixed(2)}
RESULTADO ACUMULADO: R$ ${(totalRec - totalDesp).toFixed(2)}

SÉRIE MENSAL:
${serieMensal.map(s => `${s.mes}: Receita R$${s.receita} | Despesa R$${s.despesa} | Resultado R$${s.resultado}`).join("\n")}

DESPESAS POR CATEGORIA:
${Object.entries(custosPorCategoria).sort((a, b) => b[1] - a[1]).map(([c, v]) => `${c}: R$${v.toFixed(2)} (${((v / totalDesp) * 100).toFixed(1)}%)`).join("\n")}

OPERACIONAL:
- Acolhidos ativos: ${ativos}
- Capacidade de leitos: ${capacidade}
- Taxa de ocupação: ${capacidade > 0 ? Math.round((ativos / capacidade) * 100) : 0}%
- Receita prevista/mês (mensalidades): R$ ${previstoMensal.toFixed(2)}
- Acolhidos SEM mensalidade cadastrada: ${semMensalidade}
- Receita média realizada/mês: R$ ${(totalRec / meses.length).toFixed(2)}
`;

    // If NVIDIA not available, return rule-based analysis
    if (!isAvailable()) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          contexto: serieMensal,
          custosPorCategoria,
          insights: gerarInsightsLocais(serieMensal, custosPorCategoria, totalRec, totalDesp, ativos, capacidade, previstoMensal, semMensalidade),
        },
      });
    }

    // ═══ AI-powered analysis ═══
    // For free-text questions, return prose. For the full analysis, return STRUCTURED JSON.
    if (pergunta) {
      const systemPrompt = `Você é um CFO virtual sênior de centros terapêuticos no Brasil. Responda em português, específico com números, direto ao ponto.`;
      const userPrompt = `${contexto}\n\nPERGUNTA DO GESTOR: ${pergunta}\n\nResponda com base nos dados acima, de forma objetiva.`;
      try {
        const resposta = await financialReasoning({ systemPrompt, userPrompt, maxTokens: 1500 });
        return NextResponse.json({ success: true, data: { available: true, resposta, contexto: serieMensal, custosPorCategoria } });
      } catch {
        return NextResponse.json({ success: true, data: { available: false, contexto: serieMensal, custosPorCategoria, insights: gerarInsightsLocais(serieMensal, custosPorCategoria, totalRec, totalDesp, ativos, capacidade, previstoMensal, semMensalidade) } });
      }
    }

    const systemPrompt = `Você é um CFO virtual sênior especializado em gestão financeira de centros terapêuticos no Brasil. Você DEVE responder APENAS com JSON válido (sem markdown, sem \`\`\`), seguindo EXATAMENTE este schema:

{
  "healthScore": <número 0-100 representando a saúde financeira geral>,
  "resumoExecutivo": "<1-2 frases sobre a situação geral>",
  "kpisDestaque": [
    { "label": "<nome>", "valor": "<valor formatado>", "tendencia": "up|down|neutral", "cor": "green|red|amber|blue" }
  ],
  "diagnostico": [
    { "titulo": "<curto>", "detalhe": "<1 frase com número>", "severidade": "positivo|neutro|atencao|critico" }
  ],
  "riscos": [
    { "titulo": "<curto>", "detalhe": "<1 frase com número>", "impacto": "alto|medio|baixo" }
  ],
  "oportunidades": [
    { "titulo": "<curto>", "detalhe": "<1 frase>", "ganhoPotencialMensal": <número em reais ou 0> }
  ],
  "acoes": [
    { "prioridade": <1-5>, "titulo": "<curto>", "descricao": "<1 frase acionável>", "prazo": "<ex: 30 dias>" }
  ]
}

Regras: 4-6 itens por seção no máximo. Números reais dos dados. Sem texto fora do JSON.`;

    const userPrompt = `${contexto}\n\nAnalise profundamente e retorne o JSON estruturado com diagnóstico, riscos ocultos, oportunidades (com ganho potencial mensal em reais) e ações priorizadas. Cruze dados operacionais com financeiros. Revele o que um humano deixaria passar.`;

    try {
      const raw = await financialReasoning({ systemPrompt, userPrompt, maxTokens: 3000 });
      // Extract JSON from the response (strip any markdown fences or reasoning prefix)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      let structured = null;
      if (jsonMatch) {
        try { structured = JSON.parse(jsonMatch[0]); } catch { structured = null; }
      }

      return NextResponse.json({
        success: true,
        data: {
          available: true,
          structured,
          analiseRaw: structured ? null : raw, // fallback to raw text if JSON parse failed
          contexto: serieMensal,
          custosPorCategoria,
        },
      });
    } catch (aiError) {
      console.error("AI error, falling back:", aiError);
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          contexto: serieMensal,
          custosPorCategoria,
          insights: gerarInsightsLocais(serieMensal, custosPorCategoria, totalRec, totalDesp, ativos, capacidade, previstoMensal, semMensalidade),
          erroIA: "IA temporariamente indisponível — mostrando análise baseada em regras.",
        },
      });
    }
  } catch (error) {
    console.error("POST /api/financeiro/ia-analise error:", error);
    return NextResponse.json({ success: false, error: "Erro na análise" }, { status: 500 });
  }
}

// Rule-based fallback analysis
function gerarInsightsLocais(
  serie: { mes: string; receita: number; despesa: number; resultado: number }[],
  custos: Record<string, number>,
  totalRec: number,
  totalDesp: number,
  ativos: number,
  capacidade: number,
  previsto: number,
  semMensalidade: number
): { tipo: string; titulo: string; texto: string }[] {
  const insights: { tipo: string; titulo: string; texto: string }[] = [];

  // Trend
  if (serie.length >= 3) {
    const ult3 = serie.slice(-3);
    const negativos = ult3.filter(s => s.resultado < 0).length;
    if (negativos >= 2) {
      insights.push({ tipo: "risco", titulo: "Tendência de déficit", texto: `${negativos} dos últimos 3 meses fecharam no vermelho. Padrão preocupante que exige ação sobre custos ou receita.` });
    }
  }

  // Occupancy vs revenue
  const ocupacao = capacidade > 0 ? Math.round((ativos / capacidade) * 100) : 0;
  if (ocupacao < 80 && capacidade > 0) {
    const vagas = capacidade - ativos;
    insights.push({ tipo: "oportunidade", titulo: "Capacidade ociosa", texto: `${vagas} vagas livres (${100 - ocupacao}% ociosidade). Cada vaga preenchida à mensalidade média (R$ ${ativos > 0 ? Math.round(previsto / ativos) : 0}) aumentaria a receita mensal.` });
  }

  // Missing mensalidade
  if (semMensalidade > 0) {
    insights.push({ tipo: "risco", titulo: "Receita não mapeada", texto: `${semMensalidade} acolhidos ativos sem mensalidade cadastrada. Impossível prever receita corretamente. Cadastre os valores contratuais.` });
  }

  // Top cost center
  const custoOrdenado = Object.entries(custos).sort((a, b) => b[1] - a[1]);
  if (custoOrdenado.length > 0) {
    const [maiorCat, maiorVal] = custoOrdenado[0];
    const pct = totalDesp > 0 ? Math.round((maiorVal / totalDesp) * 100) : 0;
    if (pct > 25) {
      insights.push({ tipo: "oportunidade", titulo: `Concentração em ${maiorCat}`, texto: `${maiorCat} representa ${pct}% das despesas (R$ ${maiorVal.toFixed(2)}). Renegociação de 10% economizaria R$ ${(maiorVal * 0.1).toFixed(2)}.` });
    }
  }

  // Margin
  const margem = totalRec > 0 ? Math.round(((totalRec - totalDesp) / totalRec) * 100) : 0;
  insights.push({
    tipo: margem >= 15 ? "positivo" : "risco",
    titulo: `Margem operacional: ${margem}%`,
    texto: margem >= 15 ? "Margem saudável para o setor." : margem >= 0 ? "Margem apertada — pouco espaço para imprevistos." : "Operação deficitária — ação urgente necessária.",
  });

  return insights;
}
