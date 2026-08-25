import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const createQuartoSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  andar: z.number().int().min(0).default(1),
  capacidade: z.number().int().min(1).default(1),
  tipo: z.string().optional(),
  observacoes: z.string().optional(),
});

// GET: List rooms with auto-sync of occupancy status
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;
    if (!session.tenantId) {
      return NextResponse.json({ success: true, data: [] });
    }
    where.tenantId = session.tenantId;

    const quartos = await prisma.quarto.findMany({
      where,
      include: {
        pacientes: {
          where: { status: "ATIVO", deletedAt: null },
          select: { id: true, nome: true },
        },
      },
      orderBy: { numero: "asc" },
    });

    // Auto-sync: if a room has active patients but status is not OCUPADO, fix it
    const updates: Promise<any>[] = [];
    for (const quarto of quartos) {
      const hasPatients = quarto.pacientes.length > 0;
      if (hasPatients && quarto.status === "DISPONIVEL") {
        updates.push(prisma.quarto.update({ where: { id: quarto.id }, data: { status: "OCUPADO" } }));
        quarto.status = "OCUPADO";
      } else if (!hasPatients && quarto.status === "OCUPADO") {
        updates.push(prisma.quarto.update({ where: { id: quarto.id }, data: { status: "DISPONIVEL" } }));
        quarto.status = "DISPONIVEL";
      }
    }
    if (updates.length > 0) await Promise.all(updates);

    return NextResponse.json({ success: true, data: quartos });
  } catch (error) {
    console.error("GET /api/quartos error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar quartos" }, { status: 500 });
  }
}

// POST: Create a new room
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
    const parsed = createQuartoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Check if room number already exists for this tenant
    const existing = await prisma.quarto.findFirst({
      where: { numero: parsed.data.numero, tenantId },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: `Quarto "${parsed.data.numero}" já existe` }, { status: 409 });
    }

    const quarto = await prisma.quarto.create({
      data: {
        numero: parsed.data.numero,
        andar: parsed.data.andar,
        capacidade: parsed.data.capacidade,
        tipo: parsed.data.tipo || null,
        observacoes: parsed.data.observacoes || null,
        status: "DISPONIVEL",
        tenantId,
      },
    });

    await logAudit(session.userId, "CREATE", "Quarto", quarto.id, {
      numero: quarto.numero,
      tipo: quarto.tipo,
      capacidade: quarto.capacidade,
    });

    return NextResponse.json({ success: true, data: quarto }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/quartos error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Número de quarto já existe" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Erro ao criar quarto" }, { status: 500 });
  }
}
