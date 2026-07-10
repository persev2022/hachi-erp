import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const createEvolucaoSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  tipo: z.enum(["MEDICA", "PSICOLOGICA", "ENFERMAGEM", "TERAPEUTICA", "SOCIAL", "NUTRICIONAL"]),
  conteudo: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  sinaisVitais: z
    .object({
      pa: z.string().optional(),
      fc: z.number().optional(),
      fr: z.number().optional(),
      temp: z.number().optional(),
      spo2: z.number().optional(),
      peso: z.number().optional(),
    })
    .optional(),
});

// GET: List evoluções with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");
    const tipo = searchParams.get("tipo");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    const where: any = {};

    // Tenant isolation: filter evoluções by paciente's tenant
    if (session.tenantId) {
      where.paciente = { tenantId: session.tenantId };
    }

    if (pacienteId) {
      where.pacienteId = pacienteId;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const total = await prisma.evolucao.count({ where });

    const evolucoes = await prisma.evolucao.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Audit log: record prontuário access (LGPD compliance)
    if (pacienteId) {
      logAudit(session.userId, "READ", "Prontuario", pacienteId, { tipo: tipo || "ALL" }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: evolucoes,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("GET /api/prontuario/evolucoes error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar evoluções" }, { status: 500 });
  }
}

// POST: Create evolution
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createEvolucaoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: parsed.data.pacienteId, deletedAt: null },
    });

    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    // Tenant isolation: verify patient belongs to tenant
    if (session.tenantId && paciente.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    const evolucao = await prisma.evolucao.create({
      data: {
        pacienteId: parsed.data.pacienteId,
        profissionalId: session.userId,
        tipo: parsed.data.tipo,
        conteudo: parsed.data.conteudo,
        sinaisVitais: parsed.data.sinaisVitais || undefined,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, name: true, role: true } },
      },
    });

    await logAudit(session.userId, "CREATE", "Evolucao", evolucao.id, {
      pacienteId: parsed.data.pacienteId,
      tipo: parsed.data.tipo,
    });

    return NextResponse.json({ success: true, data: evolucao }, { status: 201 });
  } catch (error) {
    console.error("POST /api/prontuario/evolucoes error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar evolução" }, { status: 500 });
  }
}
