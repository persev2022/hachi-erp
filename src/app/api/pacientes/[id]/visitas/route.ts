import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// Schema for creating a visit
const createVisitaSchema = z.object({
  visitante: z.string().min(2, "Nome do visitante é obrigatório"),
  parentesco: z.string().min(1, "Parentesco é obrigatório"),
  telefone: z.string().optional(),
  observacoes: z.string().optional(),
  entrada: z.string().optional(), // ISO date string, defaults to now
});

// Schema for updating a visit (registering saída)
const updateVisitaSchema = z.object({
  saida: z.string().optional(), // ISO date string, defaults to now
  observacoes: z.string().optional(),
});

// GET: List visits for a patient
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { id: pacienteId } = await params;
    const tenantId = session.tenantId;

    // Verify patient exists and belongs to tenant
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, deletedAt: null },
      select: { id: true, tenantId: true },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    if (tenantId && paciente.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Parse query params for filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [visitas, total] = await Promise.all([
      prisma.visita.findMany({
        where: { pacienteId },
        orderBy: { entrada: "desc" },
        skip,
        take: limit,
      }),
      prisma.visita.count({ where: { pacienteId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: visitas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/pacientes/[id]/visitas error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar visitas" },
      { status: 500 }
    );
  }
}

// POST: Register a new visit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { id: pacienteId } = await params;
    const tenantId = session.tenantId;

    // Verify patient exists and belongs to tenant
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, deletedAt: null },
      select: { id: true, tenantId: true, nome: true },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    if (tenantId && paciente.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = createVisitaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { visitante, parentesco, telefone, observacoes, entrada } = parsed.data;

    const visita = await prisma.visita.create({
      data: {
        pacienteId,
        visitante,
        parentesco,
        telefone: telefone || null,
        observacoes: observacoes || null,
        entrada: entrada ? new Date(entrada) : new Date(),
        tenantId: tenantId || null,
      },
    });

    await logAudit(session.userId, "CREATE", "Visita", visita.id, {
      pacienteId,
      visitante,
      parentesco,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: visita }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pacientes/[id]/visitas error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao registrar visita" },
      { status: 500 }
    );
  }
}

// PUT: Update a visit (register saída or update observacoes)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { id: pacienteId } = await params;
    const tenantId = session.tenantId;

    // Verify patient exists and belongs to tenant
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, deletedAt: null },
      select: { id: true, tenantId: true },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    if (tenantId && paciente.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { visitaId, ...updateData } = body;

    if (!visitaId) {
      return NextResponse.json(
        { success: false, error: "visitaId é obrigatório" },
        { status: 400 }
      );
    }

    const parsed = updateVisitaSchema.safeParse(updateData);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Verify visit belongs to this patient
    const existingVisita = await prisma.visita.findUnique({
      where: { id: visitaId },
    });

    if (!existingVisita || existingVisita.pacienteId !== pacienteId) {
      return NextResponse.json(
        { success: false, error: "Visita não encontrada" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (parsed.data.saida !== undefined) {
      data.saida = parsed.data.saida ? new Date(parsed.data.saida) : new Date();
    }
    if (parsed.data.observacoes !== undefined) {
      data.observacoes = parsed.data.observacoes;
    }

    const visita = await prisma.visita.update({
      where: { id: visitaId },
      data,
    });

    await logAudit(session.userId, "UPDATE", "Visita", visitaId, {
      pacienteId,
      fields: Object.keys(data),
    }).catch(() => {});

    return NextResponse.json({ success: true, data: visita });
  } catch (error) {
    console.error("PUT /api/pacientes/[id]/visitas error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar visita" },
      { status: 500 }
    );
  }
}
