import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Clinical report (evolutions adherence, prescriptions)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    // Total evolutions in last 30 days
    const totalEvolucoes = await prisma.evolucao.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Evolutions by type
    const evolucoesPorTipo = await prisma.evolucao.groupBy({
      by: ["tipo"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    });

    // Unsigned evolutions
    const naoAssinadas = await prisma.evolucao.count({
      where: { assinado: false },
    });

    // Active prescriptions
    const prescricoesAtivas = await prisma.prescricao.count({
      where: { ativa: true },
    });

    // Active patients
    const pacientesAtivos = await prisma.paciente.count({
      where: { status: "ATIVO", deletedAt: null },
    });

    // Adherence: evolutions per patient per month (ideal = at least 1 per day per type)
    const evolucoesPorPaciente = pacientesAtivos > 0
      ? Math.round(totalEvolucoes / pacientesAtivos)
      : 0;

    // Patients without evolution in last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const pacientesComEvolucao = await prisma.evolucao.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { pacienteId: true },
      distinct: ["pacienteId"],
    });
    const semEvolucao7dias = pacientesAtivos - pacientesComEvolucao.length;

    return NextResponse.json({
      success: true,
      data: {
        periodo: "Últimos 30 dias",
        totalEvolucoes,
        evolucoesPorTipo: evolucoesPorTipo.map((e) => ({
          tipo: e.tipo,
          quantidade: e._count,
        })),
        naoAssinadas,
        prescricoesAtivas,
        pacientesAtivos,
        evolucoesPorPaciente,
        semEvolucao7dias,
      },
    });
  } catch (error) {
    console.error("GET /api/relatorios/clinico error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
