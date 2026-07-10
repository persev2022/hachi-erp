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

    const tenantId = session.tenantId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    // Build tenant-scoped where for evolucoes (relation filter via paciente)
    const evolucaoWhere: any = { createdAt: { gte: thirtyDaysAgo } };
    if (tenantId) evolucaoWhere.paciente = { tenantId };

    // Total evolutions in last 30 days
    const totalEvolucoes = await prisma.evolucao.count({
      where: evolucaoWhere,
    });

    // Evolutions by type
    const evolucoesPorTipo = await prisma.evolucao.groupBy({
      by: ["tipo"],
      where: evolucaoWhere,
      _count: true,
    });

    // Unsigned evolutions
    const naoAssinadasWhere: any = { assinado: false };
    if (tenantId) naoAssinadasWhere.paciente = { tenantId };
    const naoAssinadas = await prisma.evolucao.count({
      where: naoAssinadasWhere,
    });

    // Active prescriptions
    const prescricoesWhere: any = { ativa: true };
    if (tenantId) prescricoesWhere.paciente = { tenantId };
    const prescricoesAtivas = await prisma.prescricao.count({
      where: prescricoesWhere,
    });

    // Active patients
    const pacientesWhere: any = { status: "ATIVO", deletedAt: null };
    if (tenantId) pacientesWhere.tenantId = tenantId;
    const pacientesAtivos = await prisma.paciente.count({
      where: pacientesWhere,
    });

    // Adherence: evolutions per patient per month
    const evolucoesPorPaciente = pacientesAtivos > 0
      ? Math.round(totalEvolucoes / pacientesAtivos)
      : 0;

    // Patients without evolution in last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const evolucao7Where: any = { createdAt: { gte: sevenDaysAgo } };
    if (tenantId) evolucao7Where.paciente = { tenantId };
    const pacientesComEvolucao = await prisma.evolucao.findMany({
      where: evolucao7Where,
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
