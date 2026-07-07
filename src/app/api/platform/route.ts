import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { getFeatures } from "@/lib/features";

/**
 * GET /api/platform
 * Returns current tenant info and feature flags.
 * Used by the frontend to render dynamic sidebar/dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    // Get tenant info if user has one
    let tenant = null;
    let vertical = "recovery"; // default

    if (session.tenantId) {
      tenant = await prisma.tenant.findUnique({
        where: { id: session.tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
          vertical: true,
          plan: true,
          config: true,
        },
      });
      if (tenant) {
        vertical = tenant.vertical;
      }
    }

    // Get feature flags for this vertical
    const features = getFeatures(vertical);

    return NextResponse.json({
      success: true,
      platform: {
        tenant: tenant
          ? {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              vertical: tenant.vertical,
              plan: tenant.plan,
            }
          : { name: "Hachi", slug: "default", vertical: "recovery", plan: "starter" },
        features,
        version: "0.2.0",
      },
    });
  } catch (error) {
    console.error("GET /api/platform error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
