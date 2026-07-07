import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { DEFAULT_RECOVERY_AUTOMATIONS } from "@/lib/automation";

/**
 * GET /api/platform/automations
 * Returns automation rules for the current tenant.
 * Phase 1: returns default rules based on vertical.
 * Phase 2: will load custom rules from DB per tenant.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    // Phase 1: return default automations for recovery
    // Phase 2: load from DB per tenant
    return NextResponse.json({
      success: true,
      data: DEFAULT_RECOVERY_AUTOMATIONS,
    });
  } catch (error) {
    console.error("GET /api/platform/automations error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
