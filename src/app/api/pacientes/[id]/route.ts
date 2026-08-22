import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

/**
 * Parse date string safely (noon UTC to avoid timezone shift)
 */
function parseDateSafe(s: string): Date {
  if (s.includes("T")) return new Date(s);
  return new Date(`${s}T12:00:00.000Z`);
}

// Schema for responsável
const responsavelSchema = z.object({
  id: z.string().uuid().optional(), // existing = update, missing = create
  nome: z.string().min(2),
  cpf: z.string().min(11),
  dataNascimento: z.string().optional().transform((s) => (s ? parseDateSafe(s) : undefined)),
  profissao: z.string().optional(),
  estadoCivil: z.enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL"]).optional().nullable(),
  parentesco: z.string().min(1),
  telefone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  endereco: z.string().optional(),
  isFinanceiro: z.boolean().optional().default(true),
});

// Zod schema for updating a patient
const updatePacienteSchema = z.object({
  nome: z.string().min(2).optional(),
  cpf: z.string().min(11).optional(),
  rg: z.string().optional(),
  dataNascimento: z.string().transform((s) => parseDateSafe(s)).optional(),
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
  dataAdmissao: z.string().transform((s) => parseDateSafe(s)).optional(),
  dataAltaPrevista: z.string().optional().transform((s) => (s ? parseDateSafe(s) : undefined)),
  dataAlta: z.string().optional().transform((s) => (s ? parseDateSafe(s) : undefined)),
  diasTratamento: z.number().int().min(1).optional(),
  quartoId: z.string().uuid().optional().nullable(),

  // Financeiro
  matriculaValor: z.number().optional(),
  mensalidadeValor: z.number().optional(),
  diaVencimento: z.number().int().optional(),

  // Foto
  foto: z.string().optional().nullable(),

  // Responsáveis (array — full replacement/upsert)
  responsaveis: z.array(responsavelSchema).optional(),
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

    const tenantId = session.tenantId;
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

    // Tenant isolation: verify patient belongs to tenant
    if (tenantId && paciente.tenantId !== tenantId) {
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

// PUT: Update patient (including responsáveis)
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

    const tenantId = session.tenantId;
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
      include: { responsaveis: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Tenant isolation: verify patient belongs to tenant
    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const { responsaveis: responsaveisData, ...pacienteData } = parsed.data;

    // Update patient + responsáveis in transaction
    const paciente = await prisma.$transaction(async (tx) => {
      // Update patient fields
      const updated = await tx.paciente.update({
        where: { id },
        data: pacienteData,
      });

      // Handle responsáveis if provided
      if (responsaveisData !== undefined) {
        const existingIds = existing.responsaveis.map(r => r.id);
        const submittedIds = responsaveisData.filter(r => r.id).map(r => r.id!);

        // Delete removed responsáveis
        const toDelete = existingIds.filter(eid => !submittedIds.includes(eid));
        if (toDelete.length > 0) {
          await tx.responsavel.deleteMany({ where: { id: { in: toDelete } } });
        }

        // Upsert each responsável
        for (const resp of responsaveisData) {
          const { id: respId, ...respData } = resp;
          if (respId && existingIds.includes(respId)) {
            // Update existing
            await tx.responsavel.update({
              where: { id: respId },
              data: { ...respData, email: respData.email || null },
            });
          } else {
            // Create new
            await tx.responsavel.create({
              data: {
                pacienteId: id,
                ...respData,
                email: respData.email || null,
              },
            });
          }
        }
      }

      return tx.paciente.findUnique({
        where: { id },
        include: {
          responsaveis: true,
          quarto: { select: { numero: true } },
        },
      });
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

    const tenantId = session.tenantId;
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

    // Tenant isolation: verify patient belongs to tenant
    if (tenantId && existing.tenantId !== tenantId) {
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
