import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET: System alerts/notifications for the current user.
 * Checks: inadimplência, estoque baixo, evoluções pendentes, agendamentos próximos.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const tenantId = session.tenantId;
    const alertas: { id: string; tipo: string; msg: string; prioridade: "alta" | "media" | "baixa"; link?: string }[] = [];
    const now = new Date();

    // --- Inadimplência (ADMIN, FINANCEIRO) ---
    if (["ADMIN", "FINANCEIRO"].includes(session.role)) {
      // Update overdue entries (tenant-scoped)
      const updateWhere: any = {
        tipo: "RECEITA",
        status: "PENDENTE",
        dataVencimento: { lt: now },
      };
      if (tenantId) updateWhere.tenantId = tenantId;

      await prisma.movimentacaoFinanceira.updateMany({
        where: updateWhere,
        data: { status: "ATRASADO" },
      });

      const atrasadosWhere: any = { status: "ATRASADO", tipo: "RECEITA" };
      if (tenantId) atrasadosWhere.tenantId = tenantId;

      const atrasados = await prisma.movimentacaoFinanceira.findMany({
        where: atrasadosWhere,
        include: { paciente: { select: { nome: true } } },
        take: 10,
      });

      for (const mov of atrasados) {
        alertas.push({
          id: `fin-${mov.id}`,
          tipo: "financeiro",
          msg: `${mov.paciente?.nome || "Sem paciente"} — ${mov.descricao} (R$ ${mov.valor.toFixed(2)}) vencida`,
          prioridade: "alta",
          link: "/financeiro",
        });
      }
    }

    // --- Estoque baixo (ADMIN, ENFERMEIRO) ---
    if (["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR"].includes(session.role)) {
      const estoqueWhere: any = {};
      if (tenantId) estoqueWhere.tenantId = tenantId;

      const items = await prisma.itemEstoque.findMany({ where: estoqueWhere });
      const baixos = items.filter((i) => i.quantidade <= i.minimo);
      for (const item of baixos.slice(0, 5)) {
        alertas.push({
          id: `est-${item.id}`,
          tipo: "estoque",
          msg: `${item.nome}: ${item.quantidade}/${item.minimo} ${item.unidade}`,
          prioridade: "media",
          link: "/estoque",
        });
      }
    }

    // --- Evoluções não assinadas (profissionais clínicos) ---
    if (["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA"].includes(session.role)) {
      const evoWhere: any = { assinado: false };
      if (tenantId) evoWhere.paciente = { tenantId };
      if (!["ADMIN", "COORDENADOR"].includes(session.role)) evoWhere.profissionalId = session.userId;

      const pendentes = await prisma.evolucao.count({ where: evoWhere });
      if (pendentes > 0) {
        alertas.push({
          id: "evo-pendentes",
          tipo: "clinico",
          msg: `${pendentes} evolução(ões) aguardando assinatura`,
          prioridade: "media",
          link: "/prontuario",
        });
      }
    }

    // --- Agendamentos próximos (30 min) ---
    const in30min = new Date(now.getTime() + 30 * 60000);
    const agendaWhere: any = {
      dataHora: { gte: now, lte: in30min },
      status: { in: ["AGENDADO", "CONFIRMADO"] },
    };
    if (tenantId) agendaWhere.paciente = { tenantId };
    if (!["ADMIN", "COORDENADOR", "SECRETARIA"].includes(session.role)) {
      agendaWhere.profissionalId = session.userId;
    }

    const proximoCount = await prisma.agendamento.count({ where: agendaWhere });
    if (proximoCount > 0) {
      alertas.push({
        id: "agenda-proximo",
        tipo: "agenda",
        msg: `${proximoCount} atendimento(s) nos próximos 30 minutos`,
        prioridade: "alta",
        link: "/agenda",
      });
    }

    return NextResponse.json({
      success: true,
      data: alertas,
      count: alertas.length,
    });
  } catch (error) {
    console.error("GET /api/relatorios/alertas error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar alertas" }, { status: 500 });
  }
}
