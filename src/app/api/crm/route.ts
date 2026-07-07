import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api-helpers";

const ALLOWED_ROLES = ["ADMIN", "COORDENADOR", "SECRETARIA"];

/**
 * GET /api/crm
 * Returns patients grouped by status (funnel view) with counts.
 * CRM perspective on existing patient data.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return apiUnauthorized();
    if (!ALLOWED_ROLES.includes(session.role)) return apiForbidden();

    const tenantFilter = session.tenantId ? { tenantId: session.tenantId } : {};

    // Get counts by status (funnel)
    const [ativos, alta, evadidos] = await Promise.all([
      prisma.paciente.count({
        where: { ...tenantFilter, status: "ATIVO", deletedAt: null },
      }),
      prisma.paciente.count({
        where: { ...tenantFilter, status: "ALTA", deletedAt: null },
      }),
      prisma.paciente.count({
        where: { ...tenantFilter, status: "EVADIDO", deletedAt: null },
      }),
    ]);

    // Get recent patients per status (top 10 each for quick view)
    const [recentAtivos, recentAlta, recentEvadidos] = await Promise.all([
      prisma.paciente.findMany({
        where: { ...tenantFilter, status: "ATIVO", deletedAt: null },
        select: { id: true, nome: true, dataAdmissao: true, telefone: true, substanciaPrincipal: true },
        orderBy: { dataAdmissao: "desc" },
        take: 10,
      }),
      prisma.paciente.findMany({
        where: { ...tenantFilter, status: "ALTA", deletedAt: null },
        select: { id: true, nome: true, dataAlta: true, telefone: true, diasTratamento: true },
        orderBy: { dataAlta: "desc" },
        take: 10,
      }),
      prisma.paciente.findMany({
        where: { ...tenantFilter, status: "EVADIDO", deletedAt: null },
        select: { id: true, nome: true, updatedAt: true, telefone: true, diasTratamento: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

    return apiSuccess({
      funnel: {
        ATIVO: { count: ativos, patients: recentAtivos },
        ALTA: { count: alta, patients: recentAlta },
        EVADIDO: { count: evadidos, patients: recentEvadidos },
      },
      total: ativos + alta + evadidos,
    });
  } catch (error) {
    console.error("GET /api/crm error:", error);
    return apiError("Erro ao buscar dados do CRM", 500);
  }
}
