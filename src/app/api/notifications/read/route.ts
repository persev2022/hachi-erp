import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-helpers";
import { markManyAsRead, markAllAsRead } from "@/lib/notifications";

/**
 * PUT /api/notifications/read
 * Mark notifications as read.
 * Accepts: { ids: string[] } to mark specific ones, or { all: true } to mark all.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return apiUnauthorized();

    const body = await req.json();

    let count = 0;

    if (body.all === true) {
      count = await markAllAsRead(session.userId);
    } else if (Array.isArray(body.ids) && body.ids.length > 0) {
      count = await markManyAsRead(body.ids);
    } else {
      return apiError("Envie { ids: string[] } ou { all: true }");
    }

    return apiSuccess({ marked: count });
  } catch (error) {
    console.error("PUT /api/notifications/read error:", error);
    return apiError("Erro ao marcar notificações como lidas", 500);
  }
}
