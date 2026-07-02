import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Dashboard KPIs (real data from database)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    // Pacientes ativos
    const pacientesAtivos = await prisma.paciente.count({
      where: { status: "ATIVO", deletedAt: null },
    });

    // Quartos e ocupação
    const totalQuartos = await prisma.quarto.count();
    const quartosOcupados = await prisma.quarto.count({ where: { status: "OCUPADO" } });
    const ocupacao = totalQuartos > 0 ? Math.round((quartosOcupados / totalQuartos) * 100) : 0;

    // Agendamentos hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const agendamentosHoje = await prisma.agendamento.count({
      where: {
        dataHora: { gte: today, lt: tomorrow },
        status: { notIn: ["CANCELADO"] },
      },
    });

    // Receita do mês
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const receitaMes = await prisma.movimentacaoFinanceira.aggregate({
      where: {
        tipo: "RECEITA",
        status: "PAGO",
        dataPagamento: { gte: firstOfMonth, lte: lastOfMonth },
      },
      _sum: { valor: true },
    });

    // Inadimplentes (atrasados)
    const inadimplentes = await prisma.movimentacaoFinanceira.count({
      where: { status: "ATRASADO", tipo: "RECEITA" },
    });

    // Evoluções não assinadas
    const evolucoesPendentes = await prisma.evolucao.count({
      where: { assinado: false },
    });

    // Estoque abaixo do mínimo
    const todosItems = await prisma.itemEstoque.findMany({
      select: { quantidade: true, minimo: true },
    });
    const estoqueBaixo = todosItems.filter((i) => i.quantidade <= i.minimo).length;

    // Próximos agendamentos de hoje
    const proximosAgendamentos = await prisma.agendamento.findMany({
      where: {
        dataHora: { gte: new Date(), lt: tomorrow },
        status: { notIn: ["CANCELADO", "CONCLUIDO"] },
      },
      include: {
        paciente: { select: { nome: true } },
        profissional: { select: { name: true } },
      },
      orderBy: { dataHora: "asc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          pacientesAtivos,
          ocupacao,
          agendamentosHoje,
          receitaMes: receitaMes._sum.valor || 0,
          inadimplentes,
          evolucoesPendentes,
          estoqueBaixo,
        },
        proximosAgendamentos: proximosAgendamentos.map((a) => ({
          id: a.id,
          hora: a.dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          paciente: a.paciente.nome,
          tipo: a.tipo,
          profissional: a.profissional.name,
        })),
        alertas: [
          ...(inadimplentes > 0 ? [{ msg: `${inadimplentes} mensalidade(s) vencida(s)`, tipo: "financeiro" }] : []),
          ...(estoqueBaixo > 0 ? [{ msg: `${estoqueBaixo} item(ns) abaixo do estoque mínimo`, tipo: "estoque" }] : []),
          ...(evolucoesPendentes > 0 ? [{ msg: `${evolucoesPendentes} evolução(ões) não assinada(s)`, tipo: "clinico" }] : []),
        ],
      },
    });
  } catch (error) {
    console.error("GET /api/relatorios/dashboard error:", error);
    return NextResponse.json({ success: false, error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
