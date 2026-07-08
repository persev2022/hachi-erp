import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const timesheetSchema = z.object({
  projeto: z.string().min(1),
  tarefa: z.string().min(1),
  horas: z.number().min(0.1),
  data: z.string().min(1), // ISO date
  profissional: z.string().min(1),
  observacoes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    // Check vertical
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
      if (tenant?.vertical !== "services") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Services" }, { status: 403 });
    }

    const key = `services_timesheet_${session.tenantId || "default"}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });

    let entries: unknown[] = [];
    if (config) { try { entries = JSON.parse(config.value); } catch { /* ignore */ } }

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("GET /api/services/timesheet error:", error);
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
      if (tenant?.vertical !== "services") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Services" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = timesheetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const key = `services_timesheet_${session.tenantId || "default"}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });

    let entries: unknown[] = [];
    if (config) { try { entries = JSON.parse(config.value); } catch { /* ignore */ } }

    const newEntry = { id: crypto.randomUUID(), ...parsed.data, createdAt: new Date().toISOString() };
    (entries as Record<string, unknown>[]).push(newEntry);

    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(entries) },
      create: { key, value: JSON.stringify(entries) },
    });

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services/timesheet error:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}
