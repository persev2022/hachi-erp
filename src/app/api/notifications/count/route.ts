import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-helpers";
import { getUnreadCount } from "@/lib/notifications";

/**
 * GET /api/notifications/count
 * Returns unread notification count for the current user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return apiUnauthorized();

    const count = await getUnreadCount(session.userId);

    return apiSuccess({ unread: count });
  } catch (error) {
    console.error("GET /api/notifications/count error:", error);
    return apiError("Erro ao contar notificações", 500);
  }
}
