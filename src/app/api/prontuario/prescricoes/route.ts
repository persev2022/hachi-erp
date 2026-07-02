import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const createPrescricaoSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  medicamento: z.string().min(2, "Medicamento é obrigatório"),
  dosagem: z.string().min(1, "Dosagem é obrigatória"),
  via: z.string().min(1, "Via de administração é obrigatória"),
  frequencia: z.string().min(1, "Frequência é obrigatória"),
  duracao: z.string().optional(),
  observacoes: z.string().optional(),
});

// GET: List prescriptions
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");
    const ativa = searchParams.get("ativa");

    const where: any = {};

    if (pacienteId) {
      where.pacienteId = pacienteId;
    }

    if (ativa !== null && ativa !== "") {
      where.ativa = ativa === "true";
    }

    const prescricoes = await prisma.prescricao.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true } },
        medico: { select: { id: true, name: true, crm: true } },
      },
      orderBy: [{ ativa: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: prescricoes });
  } catch (error) {
    console.error("GET /api/prontuario/prescricoes error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar prescrições" }, { status: 500 });
  }
}

// POST: Create prescription (only MEDICO role)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    // Only doctors can prescribe
    if (!["ADMIN", "MEDICO"].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Apenas médicos podem criar prescrições" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createPrescricaoSchema.safeParse(body);

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

    const prescricao = await prisma.prescricao.create({
      data: {
        pacienteId: parsed.data.pacienteId,
        medicoId: session.userId,
        medicamento: parsed.data.medicamento,
        dosagem: parsed.data.dosagem,
        via: parsed.data.via,
        frequencia: parsed.data.frequencia,
        duracao: parsed.data.duracao,
        observacoes: parsed.data.observacoes,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        medico: { select: { id: true, name: true, crm: true } },
      },
    });

    await logAudit(session.userId, "CREATE", "Prescricao", prescricao.id, {
      pacienteId: parsed.data.pacienteId,
      medicamento: parsed.data.medicamento,
    });

    return NextResponse.json({ success: true, data: prescricao }, { status: 201 });
  } catch (error) {
    console.error("POST /api/prontuario/prescricoes error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar prescrição" }, { status: 500 });
  }
}
