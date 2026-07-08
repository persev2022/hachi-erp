import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const gradeSchema = z.object({
  disciplina: z.string().min(1),
  professor: z.string().optional(),
  cargaHoraria: z.number().min(1),
  serie: z.string().min(1),
  turno: z.enum(["MANHA", "TARDE", "NOITE"]),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    // Check vertical
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
      if (tenant?.vertical !== "education") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Education" }, { status: 403 });
    }

    const key = `education_grade_${session.tenantId || "default"}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });

    let grade: unknown[] = [];
    if (config) { try { grade = JSON.parse(config.value); } catch { /* ignore */ } }

    return NextResponse.json({ success: true, data: grade });
  } catch (error) {
    console.error("GET /api/education/grade error:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    // Check vertical
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
      if (tenant?.vertical !== "education") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Education" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = gradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const key = `education_grade_${session.tenantId || "default"}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });

    let grade: unknown[] = [];
    if (config) { try { grade = JSON.parse(config.value); } catch { /* ignore */ } }

    const newDisciplina = { id: crypto.randomUUID(), ...parsed.data, createdAt: new Date().toISOString() };
    (grade as Record<string, unknown>[]).push(newDisciplina);

    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(grade) },
      create: { key, value: JSON.stringify(grade) },
    });

    return NextResponse.json({ success: true, data: newDisciplina }, { status: 201 });
  } catch (error) {
    console.error("POST /api/education/grade error:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}
