import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const updateTenantSchema = z.object({
  active: z.boolean().optional(),
  plan: z.enum(["starter", "professional", "enterprise"]).optional(),
  config: z.record(z.unknown()).optional(),
});

// GET: Get tenant detail (super-admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        vertical: tenant.vertical,
        plan: tenant.plan,
        active: tenant.active,
        config: tenant.config,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        users: tenant.users,
      },
    });
  } catch (error) {
    console.error("GET /api/platform/tenants/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

// PUT: Update tenant (super-admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Tenant não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateTenantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { active, plan, config } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (active !== undefined) updateData.active = active;
    if (plan !== undefined) updateData.plan = plan;
    if (config !== undefined) updateData.config = config;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        vertical: tenant.vertical,
        plan: tenant.plan,
        active: tenant.active,
        config: tenant.config,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error) {
    console.error("PUT /api/platform/tenants/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar tenant" }, { status: 500 });
  }
}
