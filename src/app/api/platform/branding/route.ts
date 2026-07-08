import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/platform/branding
 * Returns tenant branding configuration (name, primary color, logo).
 * Falls back to defaults if no tenant or no branding config.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    const defaults = {
      name: "Hachi",
      primaryColor: null as string | null,
      logo: null as string | null,
    };

    if (!session?.tenantId) {
      return NextResponse.json({ success: true, ...defaults });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { name: true, config: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: true, ...defaults });
    }

    // Extract branding from tenant config JSON
    const config = tenant.config as Record<string, unknown> | null;
    const branding = config?.branding as Record<string, string> | undefined;

    return NextResponse.json({
      success: true,
      name: tenant.name || defaults.name,
      primaryColor: branding?.primaryColor || defaults.primaryColor,
      logo: branding?.logo || defaults.logo,
    });
  } catch (error) {
    console.error("GET /api/platform/branding error:", error);
    return NextResponse.json(
      { success: true, name: "Hachi", primaryColor: null, logo: null },
      { status: 200 }
    );
  }
}
