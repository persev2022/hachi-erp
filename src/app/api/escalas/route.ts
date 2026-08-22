import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/escalas
 * Returns shift schedules for the current week/month.
 * Stores in SystemConfig as JSON (no new model needed).
 * 
 * POST /api/escalas
 * Creates/updates a shift entry.
 */

interface EscalaEntry {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  profissionalRole: string;
  data: string; // ISO date
  turno: "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";
  observacoes?: string;
}

const createEscalaSchema = z.object({
  profissionalId: z.string().uuid(),
  data: z.string(), // yyyy-mm-dd
  turno: z.enum(["MANHA", "TARDE", "NOITE", "INTEGRAL"]),
  observacoes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: [] });

    const { searchParams } = new URL(req.url);
    const semana = searchParams.get("semana"); // yyyy-mm-dd (monday of the week)

    // Get from SystemConfig
    const key = `escalas:${tenantId}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    const allEscalas: EscalaEntry[] = config ? JSON.parse(config.value) : [];

    // Filter by week if specified
    let filtered = allEscalas;
    if (semana) {
      const start = new Date(semana);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      filtered = allEscalas.filter(e => {
        const d = new Date(e.data);
        return d >= start && d < end;
      });
    } else {
      // Default: current week
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 7);
      filtered = allEscalas.filter(e => {
        const d = new Date(e.data);
        return d >= monday && d < sunday;
      });
    }

    // Get professionals for the tenant
    const profissionais = await prisma.user.findMany({
      where: { tenantId, active: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: filtered.sort((a, b) => a.data.localeCompare(b.data)),
      profissionais,
    });
  } catch (error) {
    console.error("GET /api/escalas error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Tenant não identificado" }, { status: 400 });

    const body = await req.json();
    const parsed = createEscalaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Verify professional belongs to tenant
    const prof = await prisma.user.findFirst({
      where: { id: parsed.data.profissionalId, tenantId },
      select: { id: true, name: true, role: true },
    });
    if (!prof) return NextResponse.json({ success: false, error: "Profissional não encontrado" }, { status: 404 });

    // Load existing escalas
    const key = `escalas:${tenantId}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    const allEscalas: EscalaEntry[] = config ? JSON.parse(config.value) : [];

    // Check if entry already exists for same prof + date + turno
    const existing = allEscalas.findIndex(e =>
      e.profissionalId === parsed.data.profissionalId &&
      e.data === parsed.data.data &&
      e.turno === parsed.data.turno
    );

    const entry: EscalaEntry = {
      id: existing >= 0 ? allEscalas[existing].id : crypto.randomUUID(),
      profissionalId: parsed.data.profissionalId,
      profissionalNome: prof.name,
      profissionalRole: prof.role,
      data: parsed.data.data,
      turno: parsed.data.turno,
      observacoes: parsed.data.observacoes,
    };

    if (existing >= 0) {
      allEscalas[existing] = entry;
    } else {
      allEscalas.push(entry);
    }

    // Save
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(allEscalas) },
      create: { key, value: JSON.stringify(allEscalas) },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/escalas error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Tenant não identificado" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const escalaId = searchParams.get("id");
    if (!escalaId) return NextResponse.json({ success: false, error: "ID obrigatório" }, { status: 400 });

    const key = `escalas:${tenantId}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (!config) return NextResponse.json({ success: false, error: "Não encontrado" }, { status: 404 });

    const allEscalas: EscalaEntry[] = JSON.parse(config.value);
    const filtered = allEscalas.filter(e => e.id !== escalaId);

    await prisma.systemConfig.update({
      where: { key },
      data: { value: JSON.stringify(filtered) },
    });

    return NextResponse.json({ success: true, message: "Escala removida" });
  } catch (error) {
    console.error("DELETE /api/escalas error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
