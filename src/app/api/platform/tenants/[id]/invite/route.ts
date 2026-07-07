import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { randomBytes } from "crypto";

const inviteSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum([
    "ADMIN",
    "COORDENADOR",
    "MEDICO",
    "PSICOLOGO",
    "ENFERMEIRO",
    "TERAPEUTA",
    "SECRETARIA",
    "FINANCEIRO",
    "MONITOR",
    "APOIO",
  ]),
});

/**
 * POST /api/platform/tenants/[id]/invite
 * Generate an invite for a new user to join a tenant.
 * Creates the user with a temporary password and returns credentials.
 * ADMIN only.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { id: tenantId } = await params;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, role } = parsed.data;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Generate temporary password (8 chars alphanumeric)
    const tempPassword = randomBytes(4).toString("hex"); // 8 hex chars
    const hashedPassword = await hashPassword(tempPassword);

    // Generate invite code
    const inviteCode = randomBytes(16).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
        tenantId,
        active: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId,
          inviteCode,
          temporaryPassword: tempPassword,
          message: "Usuário criado. Compartilhe as credenciais com o convidado. Ele deve trocar a senha no primeiro acesso.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/platform/tenants/[id]/invite error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar convite" }, { status: 500 });
  }
}
