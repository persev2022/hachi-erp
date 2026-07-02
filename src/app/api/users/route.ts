import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { validatePassword } from "@/lib/security/password-policy";

const createUserSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: z.enum(["ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA", "FINANCEIRO", "MONITOR", "APOIO"]),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  crm: z.string().optional(),
  crp: z.string().optional(),
  coren: z.string().optional(),
});

// GET: List users/professionals (for selectors in forms)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // filter by role
    const active = searchParams.get("active");

    const where: any = {};

    if (role) {
      // Support comma-separated roles
      const roles = role.split(",").map((r) => r.trim());
      where.role = { in: roles };
    }

    if (active !== null && active !== "") {
      where.active = active === "true";
    } else {
      where.active = true; // Default: only active users
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        crm: true,
        crp: true,
        coren: true,
        phone: true,
        active: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

// POST: Create new user (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Apenas ADMIN pode criar usuários" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Enforce password policy
    const policyResult = validatePassword(parsed.data.password);
    if (!policyResult.valid) {
      return NextResponse.json(
        { success: false, error: "Senha não atende política", details: { password: policyResult.errors } },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: parsed.data.role,
        phone: parsed.data.phone,
        cpf: parsed.data.cpf,
        crm: parsed.data.crm,
        crp: parsed.data.crp,
        coren: parsed.data.coren,
      },
      select: {
        id: true, name: true, email: true, role: true, active: true,
      },
    });

    await logAudit(session.userId, "CREATE", "User", user.id, {
      name: parsed.data.name,
      role: parsed.data.role,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Email já cadastrado" }, { status: 409 });
    }
    console.error("POST /api/users error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar usuário" }, { status: 500 });
  }
}
