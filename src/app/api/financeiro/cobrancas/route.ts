import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/financeiro/cobrancas
 * Returns a comprehensive view of mensalidades/cobranças organized by:
 * - Patient name, responsible person, due date, status, value
 * - Summary stats (total due, overdue, paid this month, etc.)
 * - Upcoming due dates for proactive collection
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "FINANCEIRO", "COORDENADOR", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: null });

    const now = new Date();
    const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get active patients with financial info + responsáveis
    const pacientes = await prisma.paciente.findMany({
      where: { tenantId, status: "ATIVO", deletedAt: null },
      select: {
        id: true,
        nome: true,
        mensalidadeValor: true,
        diaVencimento: true,
        dataAdmissao: true,
        responsaveis: {
          where: { isFinanceiro: true },
          select: { nome: true, telefone: true, email: true, parentesco: true },
          take: 1,
        },
      },
      orderBy: { nome: "asc" },
    });

    // Get all mensalidade movimentações for this tenant (last 6 months + future)
    // Usa dia 1 para evitar overflow de mês (ex: 31/ago - 6 meses)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const mensalidades = await prisma.movimentacaoFinanceira.findMany({
      where: {
        tenantId,
        categoria: "MENSALIDADE",
        tipo: "RECEITA",
        dataVencimento: { gte: sixMonthsAgo },
      },
      select: {
        id: true,
        pacienteId: true,
        valor: true,
        dataVencimento: true,
        dataPagamento: true,
        status: true,
        formaPagamento: true,
        descricao: true,
      },
      orderBy: { dataVencimento: "desc" },
    });

    // Build comprehensive view per patient
    const cobrancas = pacientes.map(pac => {
      const resp = pac.responsaveis[0] || null;
      const pacMensalidades = mensalidades.filter(m => m.pacienteId === pac.id);

      // Current month status
      const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const mensalidadeMesAtual = pacMensalidades.find(m => {
        const mDate = new Date(m.dataVencimento);
        return `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, "0")}` === mesAtual;
      });

      // Overdue count
      const atrasados = pacMensalidades.filter(m =>
        (m.status === "PENDENTE" || m.status === "ATRASADO") && new Date(m.dataVencimento) < hoje
      );

      // Próximo vencimento — protege contra overflow de mês (ex: dia 31 em fevereiro)
      const diaVenc = pac.diaVencimento || 5;
      const diaSeguroNoMes = (ano: number, mes: number) => {
        const ultimoDia = new Date(ano, mes + 1, 0).getDate(); // último dia do mês
        return Math.min(diaVenc, ultimoDia);
      };
      const anoMesAtual = { ano: now.getFullYear(), mes: now.getMonth() };
      let proximoVencimento = new Date(anoMesAtual.ano, anoMesAtual.mes, diaSeguroNoMes(anoMesAtual.ano, anoMesAtual.mes), 12, 0, 0);
      if (proximoVencimento < hoje) {
        const prox = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        proximoVencimento = new Date(prox.getFullYear(), prox.getMonth(), diaSeguroNoMes(prox.getFullYear(), prox.getMonth()), 12, 0, 0);
      }

      // Days until next due
      const diasAteVencimento = Math.ceil((proximoVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      return {
        pacienteId: pac.id,
        pacienteNome: pac.nome,
        responsavel: resp ? { nome: resp.nome, telefone: resp.telefone, email: resp.email, parentesco: resp.parentesco } : null,
        mensalidadeValor: pac.mensalidadeValor || 0,
        diaVencimento: diaVenc,
        proximoVencimento: proximoVencimento.toISOString(),
        diasAteVencimento,
        statusMesAtual: mensalidadeMesAtual?.status || "SEM_REGISTRO",
        totalAtrasados: atrasados.length,
        valorAtrasado: atrasados.reduce((s, m) => s + m.valor, 0),
        historico: pacMensalidades.slice(0, 6).map(m => ({
          id: m.id,
          valor: m.valor,
          dataVencimento: m.dataVencimento.toISOString(),
          dataPagamento: m.dataPagamento?.toISOString() || null,
          status: m.status,
          formaPagamento: m.formaPagamento,
        })),
      };
    });

    // Summary stats
    const totalAcolhidosAtivos = pacientes.length;
    const totalMensalidade = pacientes.reduce((s, p) => s + (p.mensalidadeValor || 0), 0);
    const comAtraso = cobrancas.filter(c => c.totalAtrasados > 0);
    const totalAtrasado = comAtraso.reduce((s, c) => s + c.valorAtrasado, 0);
    const pagosMesAtual = cobrancas.filter(c => c.statusMesAtual === "PAGO").length;
    const pendentesMesAtual = cobrancas.filter(c => c.statusMesAtual === "PENDENTE" || c.statusMesAtual === "SEM_REGISTRO").length;

    // Vencendo nos próximos 7 dias
    const vencendoEm7Dias = cobrancas.filter(c => c.diasAteVencimento >= 0 && c.diasAteVencimento <= 7 && c.statusMesAtual !== "PAGO");

    // Group by day of the month (dia 5 vs dia 20)
    const porDiaVencimento: Record<number, typeof cobrancas> = {};
    for (const c of cobrancas) {
      if (!porDiaVencimento[c.diaVencimento]) porDiaVencimento[c.diaVencimento] = [];
      porDiaVencimento[c.diaVencimento].push(c);
    }

    return NextResponse.json({
      success: true,
      data: {
        resumo: {
          totalAcolhidosAtivos,
          totalMensalidadePrevista: totalMensalidade,
          totalAtrasado,
          acolhidosComAtraso: comAtraso.length,
          pagosMesAtual,
          pendentesMesAtual,
          taxaAdimplencia: totalAcolhidosAtivos > 0 ? Math.round((pagosMesAtual / totalAcolhidosAtivos) * 100) : 0,
        },
        vencendoEm7Dias,
        porDiaVencimento,
        cobrancas,
      },
    });
  } catch (error) {
    console.error("GET /api/financeiro/cobrancas error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
