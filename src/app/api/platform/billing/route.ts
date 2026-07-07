import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api-helpers";
import { checkPlanLimits, PLANS } from "@/lib/billing";

/**
 * GET /api/platform/billing
 * Returns current plan info + usage for the logged-in user's tenant.
 * ADMIN only.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return apiUnauthorized();
    if (session.role !== "ADMIN") return apiForbidden();

    if (!session.tenantId) {
      return apiError("Tenant não configurado para este usuário", 400);
    }

    const limits = await checkPlanLimits(session.tenantId);
    const plan = PLANS[limits.plan] || PLANS.starter;

    return apiSuccess({
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: plan.features,
      },
      usage: {
        users: {
          current: limits.currentUsers,
          max: limits.maxUsers,
          unlimited: limits.maxUsers === -1,
        },
        patients: {
          current: limits.currentPatients,
          max: limits.maxPatients,
          unlimited: limits.maxPatients === -1,
        },
      },
      withinLimits: limits.withinLimits,
      availablePlans: Object.values(PLANS).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        features: p.features,
        limits: p.limits,
      })),
    });
  } catch (error) {
    console.error("GET /api/platform/billing error:", error);
    return apiError("Erro ao buscar informações de billing", 500);
  }
}
