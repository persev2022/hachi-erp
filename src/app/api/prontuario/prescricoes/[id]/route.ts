import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// GET: Get single prescription
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

    const prescricao = await prisma.prescricao.findUnique({
      where: { id },
      include: {
        paciente: { select: { id: true, nome: true } },
        medico: { select: { id: true, name: true, crm: true } },
      },
    });

    if (!prescricao) {
      return NextResponse.json({ success: false, error: "Prescrição não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: prescricao });
  } catch (error) {
    console.error("GET /api/prontuario/prescricoes/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar prescrição" }, { status: 500 });
  }
}

// PUT: Toggle active status or update
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "MEDICO"].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Apenas médicos podem modificar prescrições" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const prescricao = await prisma.prescricao.findUnique({ where: { id } });

    if (!prescricao) {
      return NextResponse.json({ success: false, error: "Prescrição não encontrada" }, { status: 404 });
    }

    // Toggle active/inactive
    if (body.action === "toggle") {
      const updated = await prisma.prescricao.update({
        where: { id },
        data: { ativa: !prescricao.ativa },
        include: {
          paciente: { select: { id: true, nome: true } },
          medico: { select: { id: true, name: true, crm: true } },
        },
      });

      await logAudit(session.userId, "UPDATE", "Prescricao", id, {
        action: "toggle",
        ativa: updated.ativa,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // Update prescription fields
    const updateData: any = {};
    if (body.dosagem) updateData.dosagem = body.dosagem;
    if (body.frequencia) updateData.frequencia = body.frequencia;
    if (body.via) updateData.via = body.via;
    if (body.duracao !== undefined) updateData.duracao = body.duracao;
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;

    const updated = await prisma.prescricao.update({
      where: { id },
      data: updateData,
      include: {
        paciente: { select: { id: true, nome: true } },
        medico: { select: { id: true, name: true, crm: true } },
      },
    });

    await logAudit(session.userId, "UPDATE", "Prescricao", id, {
      fields: Object.keys(updateData),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/prontuario/prescricoes/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar prescrição" }, { status: 500 });
  }
}
