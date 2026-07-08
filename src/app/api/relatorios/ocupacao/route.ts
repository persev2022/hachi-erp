import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Occupancy report by period
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    // Tenant isolation: filter quartos by tenant
    const tenantFilter = session.tenantId ? { tenantId: session.tenantId } : {};

    const quartos = await prisma.quarto.findMany({
      where: tenantFilter,
      include: {
        pacientes: {
          where: { status: "ATIVO", deletedAt: null },
          select: { id: true, nome: true, dataAdmissao: true, diasTratamento: true },
        },
      },
      orderBy: { numero: "asc" },
    });

    const totalLeitos = quartos.reduce((sum, q) => sum + q.capacidade, 0);
    const totalOcupados = quartos.filter((q) => q.status === "OCUPADO").length;
    const totalDisponiveis = quartos.filter((q) => q.status === "DISPONIVEL").length;
    const totalManutencao = quartos.filter((q) => ["MANUTENCAO", "LIMPEZA"].includes(q.status)).length;

    // Average stay for active patients
    const pacientesAtivos = quartos.flatMap((q) => q.pacientes);
    const avgDias = pacientesAtivos.length > 0
      ? Math.round(
          pacientesAtivos.reduce((sum, p) => {
            const days = Math.floor((Date.now() - new Date(p.dataAdmissao).getTime()) / 86400000);
            return sum + days;
          }, 0) / pacientesAtivos.length
        )
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalQuartos: quartos.length,
        totalLeitos,
        totalOcupados,
        totalDisponiveis,
        totalManutencao,
        taxaOcupacao: totalLeitos > 0 ? Math.round((totalOcupados / quartos.length) * 100) : 0,
        permanenciaMedia: avgDias,
        quartos: quartos.map((q) => ({
          id: q.id,
          numero: q.numero,
          andar: q.andar,
          tipo: q.tipo,
          status: q.status,
          capacidade: q.capacidade,
          pacientes: q.pacientes,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/relatorios/ocupacao error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
