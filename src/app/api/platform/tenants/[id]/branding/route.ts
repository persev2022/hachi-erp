import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const brandingSchema = z.object({
  primaryColor: z.string().optional(),
  logo: z.string().max(2_000_000, "Logo deve ter no máximo 2MB").optional(),
  name: z.string().max(100).optional(),
});

/**
 * PUT /api/platform/tenants/[id]/branding
 * Updates tenant branding configuration (logo URL/data URI, primaryColor, name).
 * Super-admin only.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, config: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = brandingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { primaryColor, logo, name } = parsed.data;

    // Merge with existing config
    const existingConfig = (tenant.config as Record<string, unknown>) || {};
    const existingBranding = (existingConfig.branding as Record<string, unknown>) || {};

    const updatedBranding = {
      ...existingBranding,
      ...(primaryColor !== undefined && { primaryColor }),
      ...(logo !== undefined && { logo }),
      ...(name !== undefined && { name }),
    };

    const updatedConfig = {
      ...existingConfig,
      branding: updatedBranding,
    };

    const updated = await prisma.tenant.update({
      where: { id },
      data: { config: updatedConfig },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        branding: updatedBranding,
      },
    });
  } catch (error) {
    console.error("PUT /api/platform/tenants/[id]/branding error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar branding" },
      { status: 500 }
    );
  }
}
