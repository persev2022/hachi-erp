import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// Zod schema for updating a patient
const updatePacienteSchema = z.object({
  nome: z.string().min(2).optional(),
  cpf: z.string().min(11).optional(),
  rg: z.string().optional(),
  dataNascimento: z.string().transform((s) => new Date(s)).optional(),
  sexo: z.string().optional(),
  estadoCivil: z.enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL"]).optional(),
  profissao: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  status: z.enum(["ATIVO", "ALTA", "EVADIDO", "TRANSFERIDO", "OBITO"]).optional(),

  // Endereço
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  cep: z.string().optional(),

  // Clínico
  substanciaPrincipal: z.string().optional(),
  tempoUso: z.string().optional(),
  internacoesPrevias: z.number().int().min(0).optional(),
  comorbidades: z.string().optional(),
  alergias: z.string().optional(),

  // Tratamento
  dataAdmissao: z.string().transform((s) => new Date(s)).optional(),
  dataAltaPrevista: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  dataAlta: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  diasTratamento: z.number().int().min(1).optional(),
  quartoId: z.string().uuid().optional().nullable(),

  // Financeiro
  matriculaValor: z.number().optional(),
  mensalidadeValor: z.number().optional(),
  diaVencimento: z.number().int().optional(),
});

// GET: Get patient by ID with relations
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

    const { id } = await params;

    const paciente = await prisma.paciente.findUnique({
      where: { id, deletedAt: null },
      include: {
        responsaveis: true,
        quarto: true,
        evolucoes: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            profissional: { select: { name: true, role: true } },
          },
        },
        agendamentos: {
          where: { dataHora: { gte: new Date() } },
          orderBy: { dataHora: "asc" },
          take: 5,
          include: {
            profissional: { select: { name: true, role: true } },
          },
        },
      },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Audit: record profile access
    logAudit(session.userId, "READ", "Paciente", id, {}).catch(() => {});

    return NextResponse.json({ success: true, data: paciente });
  } catch (error) {
    console.error("GET /api/pacientes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar paciente" },
      { status: 500 }
    );
  }
}

// PUT: Update patient
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

    const { id } = await params;
    const body = await req.json();
    const parsed = updatePacienteSchema.safeParse(body);

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

    // Check if patient exists
    const existing = await prisma.paciente.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const paciente = await prisma.paciente.update({
      where: { id },
      data: parsed.data,
      include: {
        responsaveis: true,
        quarto: { select: { numero: true } },
      },
    });

    await logAudit(session.userId, "UPDATE", "Paciente", id, {
      fields: Object.keys(parsed.data),
    });

    return NextResponse.json({ success: true, data: paciente });
  } catch (error: any) {
    console.error("PUT /api/pacientes/[id] error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "CPF já cadastrado para outro paciente" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao atualizar paciente" },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete patient
export async function DELETE(
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

    const { id } = await params;

    // Check if patient exists
    const existing = await prisma.paciente.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    await prisma.paciente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAudit(session.userId, "DELETE", "Paciente", id, {
      nome: existing.nome,
    });

    return NextResponse.json({
      success: true,
      message: "Paciente removido com sucesso",
    });
  } catch (error) {
    console.error("DELETE /api/pacientes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao remover paciente" },
      { status: 500 }
    );
  }
}
