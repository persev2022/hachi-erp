import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const createAgendamentoSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  profissionalId: z.string().uuid("ID do profissional inválido"),
  tipo: z.string().min(1, "Tipo de atendimento é obrigatório"),
  dataHora: z.string().transform((s) => new Date(s)),
  duracao: z.number().int().min(10).max(480).default(50),
  observacoes: z.string().optional(),
  sala: z.string().optional(),
});

// GET: List appointments with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const data = searchParams.get("data"); // YYYY-MM-DD
    const profissionalId = searchParams.get("profissionalId");
    const pacienteId = searchParams.get("pacienteId");
    const status = searchParams.get("status");

    const where: any = {};

    // Tenant isolation: filter agendamentos by paciente's tenant
    if (session.tenantId) {
      where.paciente = { tenantId: session.tenantId };
    }

    if (data) {
      const startOfDay = new Date(data + "T00:00:00");
      const endOfDay = new Date(data + "T23:59:59");
      where.dataHora = { gte: startOfDay, lte: endOfDay };
    }

    if (profissionalId) where.profissionalId = profissionalId;
    if (pacienteId) where.pacienteId = pacienteId;
    if (status) where.status = status;

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, name: true, role: true } },
      },
      orderBy: { dataHora: "asc" },
    });

    return NextResponse.json({ success: true, data: agendamentos });
  } catch (error) {
    console.error("GET /api/agenda error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar agendamentos" }, { status: 500 });
  }
}

// POST: Create appointment
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createAgendamentoSchema.safeParse(body);

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

    // Verify professional exists
    const profissional = await prisma.user.findUnique({
      where: { id: parsed.data.profissionalId },
      select: { id: true, name: true, active: true },
    });
    if (!profissional) {
      return NextResponse.json({ success: false, error: "Profissional não encontrado" }, { status: 404 });
    }

    // Check for time conflicts
    const startTime = new Date(parsed.data.dataHora);
    const endTime = new Date(startTime.getTime() + parsed.data.duracao * 60000);

    const conflito = await prisma.agendamento.findFirst({
      where: {
        profissionalId: parsed.data.profissionalId,
        status: { notIn: ["CANCELADO"] },
        dataHora: { lt: endTime },
        AND: {
          dataHora: {
            gte: new Date(startTime.getTime() - parsed.data.duracao * 60000),
          },
        },
      },
    });

    if (conflito) {
      return NextResponse.json(
        { success: false, error: "Conflito de horário: profissional já possui agendamento neste período" },
        { status: 409 }
      );
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        pacienteId: parsed.data.pacienteId,
        profissionalId: parsed.data.profissionalId,
        tipo: parsed.data.tipo,
        dataHora: parsed.data.dataHora,
        duracao: parsed.data.duracao,
        observacoes: parsed.data.observacoes,
        sala: parsed.data.sala,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, name: true, role: true } },
      },
    });

    await logAudit(session.userId, "CREATE", "Agendamento", agendamento.id, {
      pacienteId: parsed.data.pacienteId,
      profissionalId: parsed.data.profissionalId,
      tipo: parsed.data.tipo,
      dataHora: parsed.data.dataHora,
    });

    return NextResponse.json({ success: true, data: agendamento }, { status: 201 });
  } catch (error) {
    console.error("POST /api/agenda error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar agendamento" }, { status: 500 });
  }
}
