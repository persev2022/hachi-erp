import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ESCALAS_DIR = join(process.cwd(), "data");
const ESCALAS_FILE = join(ESCALAS_DIR, "escalas.json");

interface Escala {
  id: string;
  userId: string;
  data: string; // YYYY-MM-DD
  turno: "MANHA" | "TARDE" | "NOITE";
  observacoes?: string;
  createdAt: string;
  createdBy: string;
}

async function readEscalas(): Promise<Escala[]> {
  try {
    const content = await readFile(ESCALAS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeEscalas(escalas: Escala[]): Promise<void> {
  await mkdir(ESCALAS_DIR, { recursive: true });
  await writeFile(ESCALAS_FILE, JSON.stringify(escalas, null, 2), "utf-8");
}

function generateId(): string {
  return crypto.randomUUID();
}

function getWeekDates(weekStr: string): { start: string; end: string } | null {
  // Format: YYYY-Wxx
  const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);

  // ISO week date calculation
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1);

  const startDate = new Date(startOfWeek1);
  startDate.setDate(startOfWeek1.getDate() + (week - 1) * 7);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  return { start: formatDate(startDate), end: formatDate(endDate) };
}

const createEscalaSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  turno: z.enum(["MANHA", "TARDE", "NOITE"], {
    errorMap: () => ({ message: "Turno deve ser MANHA, TARDE ou NOITE" }),
  }),
  observacoes: z.string().optional(),
});

// GET: List schedules
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const data = searchParams.get("data"); // YYYY-MM-DD
    const semana = searchParams.get("semana"); // YYYY-Wxx
    const userId = searchParams.get("userId");

    let escalas = await readEscalas();

    // Filter by specific date
    if (data) {
      escalas = escalas.filter((e) => e.data === data);
    }

    // Filter by week
    if (semana) {
      const weekRange = getWeekDates(semana);
      if (weekRange) {
        escalas = escalas.filter((e) => e.data >= weekRange.start && e.data <= weekRange.end);
      }
    }

    // Filter by user
    if (userId) {
      escalas = escalas.filter((e) => e.userId === userId);
    }

    // Enrich with user names (filtered by tenant)
    const userIds = [...new Set(escalas.map((e) => e.userId))];
    const userWhere: any = { id: { in: userIds } };
    if (session.tenantId) {
      userWhere.tenantId = session.tenantId;
    }
    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true, name: true, role: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const data_enriched = escalas.map((escala) => ({
      ...escala,
      usuario: userMap[escala.userId] || null,
    }));

    return NextResponse.json({ success: true, data: data_enriched });
  } catch (error) {
    console.error("GET /api/escalas error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar escalas" },
      { status: 500 }
    );
  }
}

// POST: Create schedule entry
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    // Only ADMIN can manage schedules
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Apenas administradores podem gerenciar escalas" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createEscalaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, name: true, role: true, active: true },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado ou inativo" },
        { status: 404 }
      );
    }

    // Check for duplicate (same user, same date, same shift)
    const escalas = await readEscalas();
    const duplicate = escalas.find(
      (e) =>
        e.userId === parsed.data.userId &&
        e.data === parsed.data.data &&
        e.turno === parsed.data.turno
    );

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Já existe uma escala para este usuário neste turno e data" },
        { status: 409 }
      );
    }

    const newEscala: Escala = {
      id: generateId(),
      userId: parsed.data.userId,
      data: parsed.data.data,
      turno: parsed.data.turno,
      observacoes: parsed.data.observacoes,
      createdAt: new Date().toISOString(),
      createdBy: session.userId,
    };

    escalas.push(newEscala);
    await writeEscalas(escalas);

    await logAudit(session.userId, "CREATE", "Escala", newEscala.id, {
      userId: parsed.data.userId,
      data: parsed.data.data,
      turno: parsed.data.turno,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newEscala,
          usuario: user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/escalas error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar escala" },
      { status: 500 }
    );
  }
}
