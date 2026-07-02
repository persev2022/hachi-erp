import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// GET: Single appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        paciente: { select: { id: true, nome: true, telefone: true } },
        profissional: { select: { id: true, name: true, role: true } },
      },
    });

    if (!agendamento) {
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: agendamento });
  } catch (error) {
    console.error("GET /api/agenda/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar agendamento" }, { status: 500 });
  }
}

// PUT: Update appointment status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const agendamento = await prisma.agendamento.findUnique({ where: { id } });

    if (!agendamento) {
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 });
    }

    const allowedTransitions: Record<string, string[]> = {
      AGENDADO: ["CONFIRMADO", "CANCELADO", "FALTA"],
      CONFIRMADO: ["EM_ATENDIMENTO", "CANCELADO", "FALTA"],
      EM_ATENDIMENTO: ["CONCLUIDO"],
    };

    const updateData: any = {};

    if (body.status) {
      const allowed = allowedTransitions[agendamento.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: `Transição inválida: ${agendamento.status} → ${body.status}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;
    if (body.sala) updateData.sala = body.sala;

    const updated = await prisma.agendamento.update({
      where: { id },
      data: updateData,
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, name: true, role: true } },
      },
    });

    await logAudit(session.userId, "UPDATE", "Agendamento", id, {
      oldStatus: agendamento.status,
      newStatus: body.status,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/agenda/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar agendamento" }, { status: 500 });
  }
}

// DELETE: Cancel appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const agendamento = await prisma.agendamento.findUnique({ where: { id } });

    if (!agendamento) {
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 });
    }

    if (["CONCLUIDO", "CANCELADO"].includes(agendamento.status)) {
      return NextResponse.json(
        { success: false, error: "Não é possível cancelar este agendamento" },
        { status: 400 }
      );
    }

    const updated = await prisma.agendamento.update({
      where: { id },
      data: { status: "CANCELADO" },
    });

    await logAudit(session.userId, "DELETE", "Agendamento", id, {
      previousStatus: agendamento.status,
    });

    return NextResponse.json({ success: true, message: "Agendamento cancelado" });
  } catch (error) {
    console.error("DELETE /api/agenda/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao cancelar agendamento" }, { status: 500 });
  }
}
