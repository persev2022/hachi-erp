import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-helpers";
import { getUserNotifications } from "@/lib/notifications";

/**
 * GET /api/notifications
 * Returns the current user's notifications (last 50, newest first).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return apiUnauthorized();

    const notifications = await getUserNotifications(session.userId, 50);

    return apiSuccess({ notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return apiError("Erro ao buscar notificações", 500);
  }
}
