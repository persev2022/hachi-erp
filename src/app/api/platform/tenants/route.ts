import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { VERTICAL_FEATURES } from "@/lib/features";

const createTenantSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  vertical: z.enum(["recovery", "clinic", "hotel", "restaurant", "senior", "services", "education", "vet"]),
  plan: z.enum(["starter", "professional", "enterprise"]).default("starter"),
});

// GET: List all tenants (super-admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    // Super admin only — verify by checking user email
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true } });
    const SUPER_ADMIN_EMAILS = ["admin@hachi.com"];
    if (!user || !SUPER_ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ success: false, error: "Acesso restrito ao super admin" }, { status: 403 });
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        vertical: t.vertical,
        plan: t.plan,
        active: t.active,
        usersCount: t._count.users,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/platform/tenants error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

// POST: Create a new tenant (super-admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createTenantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, vertical, plan } = parsed.data;

    // Check slug uniqueness
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Slug já em uso" },
        { status: 409 }
      );
    }

    // Create tenant with vertical-specific features
    const features = VERTICAL_FEATURES[vertical] || VERTICAL_FEATURES.recovery;

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        vertical,
        plan,
        active: true,
        config: {
          features: features as unknown as Record<string, boolean>,
          branding: { name, primaryColor: "#0d9488" },
        } as any,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        vertical: tenant.vertical,
        plan: tenant.plan,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/platform/tenants error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar tenant" }, { status: 500 });
  }
}
