import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/indicadores
 * Quality/operational indicators:
 * - Taxa de evasão
 * - Média de permanência
 * - Taxa de ocupação (quartos)
 * - Índice de reincidência
 * - Evoluções por paciente/mês
 * - Agendamentos concluídos vs faltantes
 * - Inadimplência rate
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "COORDENADOR", "FINANCEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: null });

    const now = new Date();
    const mesAtual = new Date(now.getFullYear(), now.getMonth(), 1);
    const tresMesesAtras = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    // All patients
    const pacientes = await prisma.paciente.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true, status: true, dataAdmissao: true, dataAlta: true,
        diasTratamento: true, internacoesPrevias: true, quartoId: true,
      },
    });

    const ativos = pacientes.filter(p => p.status === "ATIVO");
    const inativos = pacientes.filter(p => p.status !== "ATIVO");

    // === Taxa de Evasão ===
    const evadidos = pacientes.filter(p => p.status === "EVADIDO").length;
    const totalSaidas = inativos.length || 1;
    const taxaEvasao = Math.round((evadidos / totalSaidas) * 100);

    // === Média de Permanência ===
    const comAlta = pacientes.filter(p => p.dataAlta);
    let mediaPermanencia = 0;
    if (comAlta.length > 0) {
      const totalDias = comAlta.reduce((sum, p) => {
        const entrada = new Date(p.dataAdmissao).getTime();
        const saida = new Date(p.dataAlta!).getTime();
        return sum + Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));
      }, 0);
      mediaPermanencia = Math.round(totalDias / comAlta.length);
    }

    // === Taxa de Ocupação ===
    const quartos = await prisma.quarto.findMany({
      where: { tenantId },
      select: { id: true, capacidade: true },
    });
    const capacidadeTotal = quartos.reduce((s, q) => s + q.capacidade, 0);
    const taxaOcupacao = capacidadeTotal > 0 ? Math.round((ativos.length / capacidadeTotal) * 100) : 0;

    // === Índice de Reincidência ===
    const reincidentes = pacientes.filter(p => p.internacoesPrevias > 0).length;
    const taxaReincidencia = pacientes.length > 0 ? Math.round((reincidentes / pacientes.length) * 100) : 0;

    // === Evoluções últimos 30 dias ===
    const trintaDias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const evolucoes30d = await prisma.evolucao.count({
      where: { paciente: { tenantId }, createdAt: { gte: trintaDias } },
    });
    const evolucoesPorPaciente = ativos.length > 0 ? Math.round((evolucoes30d / ativos.length) * 10) / 10 : 0;

    // === Agendamentos (últimos 30 dias) ===
    const [agConcluidos, agFaltas, agTotal] = await Promise.all([
      prisma.agendamento.count({ where: { paciente: { tenantId }, dataHora: { gte: trintaDias }, status: "CONCLUIDO" } }),
      prisma.agendamento.count({ where: { paciente: { tenantId }, dataHora: { gte: trintaDias }, status: "FALTA" } }),
      prisma.agendamento.count({ where: { paciente: { tenantId }, dataHora: { gte: trintaDias } } }),
    ]);
    const taxaPresenca = agTotal > 0 ? Math.round(((agConcluidos) / (agConcluidos + agFaltas || 1)) * 100) : 100;

    // === Inadimplência ===
    const mensalidadesTotal = await prisma.movimentacaoFinanceira.count({
      where: { tenantId, categoria: "MENSALIDADE", tipo: "RECEITA", dataVencimento: { gte: tresMesesAtras } },
    });
    const mensalidadesAtrasadas = await prisma.movimentacaoFinanceira.count({
      where: { tenantId, categoria: "MENSALIDADE", tipo: "RECEITA", status: "ATRASADO" },
    });
    const taxaInadimplencia = mensalidadesTotal > 0 ? Math.round((mensalidadesAtrasadas / mensalidadesTotal) * 100) : 0;

    // === Alta por tipo (últimos 6 meses) ===
    const seisMeses = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const altasPorTipo = {
      ALTA: pacientes.filter(p => p.status === "ALTA" && p.dataAlta && new Date(p.dataAlta) >= seisMeses).length,
      EVADIDO: pacientes.filter(p => p.status === "EVADIDO" && p.dataAlta && new Date(p.dataAlta) >= seisMeses).length,
      TRANSFERIDO: pacientes.filter(p => p.status === "TRANSFERIDO" && p.dataAlta && new Date(p.dataAlta) >= seisMeses).length,
      DESISTENCIA: pacientes.filter(p => p.status === "DESISTENCIA").length,
      OBITO: pacientes.filter(p => p.status === "OBITO").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        resumo: {
          totalPacientes: pacientes.length,
          ativos: ativos.length,
          capacidadeTotal,
          vagasDisponiveis: Math.max(0, capacidadeTotal - ativos.length),
        },
        indicadores: {
          taxaOcupacao,
          taxaEvasao,
          mediaPermanencia,
          taxaReincidencia,
          evolucoesPorPaciente,
          taxaPresenca,
          taxaInadimplencia,
          evolucoes30d,
          agendamentosConcluidos: agConcluidos,
          agendamentosFaltas: agFaltas,
        },
        altasPorTipo,
      },
    });
  } catch (error) {
    console.error("GET /api/indicadores error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
