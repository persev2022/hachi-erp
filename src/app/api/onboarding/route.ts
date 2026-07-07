import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { VERTICAL_FEATURES } from "@/lib/features";

const onboardingSchema = z.object({
  // Organization
  orgName: z.string().min(2, "Nome da organização é obrigatório"),
  vertical: z.enum(["recovery", "clinic", "senior", "hotel", "restaurant", "education", "vet", "services"]),
  // Admin user
  userName: z.string().min(2, "Nome do usuário é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

/**
 * POST /api/onboarding
 * Self-service signup: creates tenant + admin user + returns session.
 * Public endpoint (no auth required).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orgName, vertical, userName, email, password } = parsed.data;

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Generate slug from org name
    const slug = orgName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30);

    // Check slug uniqueness
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      return NextResponse.json(
        { success: false, error: "Organização com nome similar já existe" },
        { status: 409 }
      );
    }

    // Get features for this vertical
    const features = VERTICAL_FEATURES[vertical] || VERTICAL_FEATURES.recovery;

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: orgName,
        slug,
        vertical,
        plan: "starter",
        active: true,
        config: { features, branding: { name: orgName, primaryColor: "#0d9488" } } as any,
      },
    });

    // Create admin user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: userName,
        email,
        password: hashedPassword,
        role: "ADMIN",
        tenantId: tenant.id,
        active: true,
      },
    });

    // Create session token
    const token = await createToken({ userId: user.id, role: "ADMIN", tenantId: tenant.id });

    // Return success with auto-login
    const response = NextResponse.json({
      success: true,
      data: {
        tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, vertical: tenant.vertical },
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    }, { status: 201 });

    // Set session cookie (auto-login after signup)
    response.cookies.set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/onboarding error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar conta" }, { status: 500 });
  }
}
