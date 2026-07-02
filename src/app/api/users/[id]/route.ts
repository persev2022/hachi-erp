import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA", "FINANCEIRO", "MONITOR", "APOIO"]).optional(),
  password: z.string().min(8).optional(),
  active: z.boolean().optional(),
  phone: z.string().optional(),
  crm: z.string().optional(),
  crp: z.string().optional(),
  coren: z.string().optional(),
});

// GET: Single user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (session.role !== "ADMIN" && session.userId !== (await params).id) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        cpf: true, crm: true, crp: true, coren: true,
        phone: true, active: true, createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}

// PUT: Update user (ADMIN only, or self for limited fields)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Only ADMIN can update other users
    if (session.role !== "ADMIN" && session.userId !== id) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: any = { ...parsed.data };

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // Non-admin can only update their own name, password, phone
    if (session.role !== "ADMIN") {
      const allowed = ["name", "password", "phone"];
      for (const key of Object.keys(updateData)) {
        if (!allowed.includes(key)) delete updateData[key];
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true,
        active: true, phone: true,
      },
    });

    await logAudit(session.userId, "UPDATE", "User", id, {
      fields: Object.keys(parsed.data).filter((k) => k !== "password"),
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Email já cadastrado" }, { status: 409 });
    }
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar" }, { status: 500 });
  }
}
