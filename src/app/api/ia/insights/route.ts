import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/ia/insights
 * Returns AI-generated insights: revenue forecast, proactive alerts, automations.
 * Works WITHOUT OpenAI key — uses rule-based logic on real data.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: { previsao: null, alertas: [], automacoes: [] } });

    const tf = { tenantId };
    const now = new Date();

    // ═══ PREVISÃO DE RECEITA ═══
    // Calculate average revenue from last 3 months
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const receitaHistorico = await prisma.movimentacaoFinanceira.aggregate({
      where: { ...tf, tipo: "RECEITA", status: "PAGO", dataPagamento: { gte: threeMonthsAgo } },
      _sum: { valor: true }, _count: true,
    });

    const pacientesAtivos = await prisma.paciente.findMany({
      where: { ...tf, status: "ATIVO", deletedAt: null },
      select: { mensalidadeValor: true },
    });

    const receitaPrevista = pacientesAtivos.reduce((s, p) => s + (p.mensalidadeValor || 0), 0);
    const mediaHistorica = (receitaHistorico._sum.valor || 0) / 3;
    const taxaRecebimento = receitaPrevista > 0 ? Math.min(100, Math.round((mediaHistorica / receitaPrevista) * 100)) : 80;
    const previsaoProximoMes = Math.round(receitaPrevista * (taxaRecebimento / 100));

    // ═══ ALERTAS PROATIVOS ═══
    const alertas: { tipo: string; severidade: "info" | "warning" | "critical"; mensagem: string }[] = [];

    // Check inadimplência
    const inadimplentes = await prisma.movimentacaoFinanceira.count({
      where: { ...tf, tipo: "RECEITA", status: "ATRASADO" },
    });
    if (inadimplentes > 0) {
      alertas.push({
        tipo: "financeiro",
        severidade: inadimplentes > 5 ? "critical" : "warning",
        mensagem: `${inadimplentes} mensalidade(s) em atraso. Risco de inadimplência de ${Math.round((inadimplentes / pacientesAtivos.length) * 100)}%.`,
      });
    }

    // Check upcoming payments (next 3 days)
    const proximosVencimentos = await prisma.movimentacaoFinanceira.count({
      where: { ...tf, tipo: "RECEITA", status: "PENDENTE", dataVencimento: { lte: new Date(now.getTime() + 3 * 86400000) } },
    });
    if (proximosVencimentos > 0) {
      alertas.push({ tipo: "financeiro", severidade: "info", mensagem: `${proximosVencimentos} pagamento(s) vencem nos próximos 3 dias.` });
    }

    // Check unsigned evolutions
    const naoAssinadas = await prisma.evolucao.count({
      where: { assinado: false, paciente: { tenantId } },
    });
    if (naoAssinadas > 3) {
      alertas.push({ tipo: "clinico", severidade: "warning", mensagem: `${naoAssinadas} evoluções aguardando assinatura.` });
    }

    // Check low stock
    const itensEstoque = await prisma.itemEstoque.findMany({ where: tf, select: { nome: true, quantidade: true, minimo: true } });
    const estoqueBaixo = itensEstoque.filter((i) => i.quantidade <= i.minimo);
    if (estoqueBaixo.length > 0) {
      alertas.push({ tipo: "estoque", severidade: "warning", mensagem: `${estoqueBaixo.length} item(ns) abaixo do estoque mínimo: ${estoqueBaixo.map(i => i.nome).slice(0, 3).join(", ")}` });
    }

    // Check occupancy
    const totalQuartos = await prisma.quarto.count({ where: tf });
    const quartosDisponiveis = await prisma.quarto.count({ where: { ...tf, status: "DISPONIVEL" } });
    if (quartosDisponiveis === 0 && totalQuartos > 0) {
      alertas.push({ tipo: "operacional", severidade: "info", mensagem: "Ocupação em 100%. Considere expansão ou lista de espera." });
    }

    // ═══ AUTOMAÇÕES SUGERIDAS ═══
    const automacoes = [
      { id: "cobranca-auto", nome: "Cobrança automática", descricao: "Enviar lembrete de pagamento 3 dias antes do vencimento via WhatsApp", status: "disponivel" },
      { id: "evolucao-alerta", nome: "Alerta de evolução", descricao: "Notificar coordenação quando evolução não for assinada em 24h", status: "disponivel" },
      { id: "estoque-reposicao", nome: "Alerta de reposição", descricao: "Notificar quando estoque atingir nível mínimo", status: "disponivel" },
      { id: "aniversario-msg", nome: "Mensagem de aniversário", descricao: "Enviar mensagem para familiares em datas especiais", status: "disponivel" },
    ];

    return NextResponse.json({
      success: true,
      data: {
        previsao: {
          receitaPrevista,
          previsaoRealista: previsaoProximoMes,
          taxaRecebimento,
          pacientesAtivos: pacientesAtivos.length,
          ticketMedio: pacientesAtivos.length > 0 ? Math.round(receitaPrevista / pacientesAtivos.length) : 0,
        },
        alertas,
        automacoes,
      },
    });
  } catch (error) {
    console.error("GET /api/ia/insights error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar insights" }, { status: 500 });
  }
}
