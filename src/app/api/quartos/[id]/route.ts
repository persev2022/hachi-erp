import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// GET: Single room with occupants
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

    const quarto = await prisma.quarto.findUnique({
      where: { id },
      include: {
        pacientes: {
          where: { status: "ATIVO", deletedAt: null },
          select: { id: true, nome: true, dataAdmissao: true },
        },
      },
    });

    if (!quarto || quarto.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Quarto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quarto });
  } catch (error) {
    console.error("GET /api/quartos/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar quarto" }, { status: 500 });
  }
}

// PUT: Update room status
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

    const quarto = await prisma.quarto.findUnique({ where: { id } });

    if (!quarto || quarto.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Quarto não encontrado" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.status) {
      const validStatuses = ["DISPONIVEL", "OCUPADO", "MANUTENCAO", "LIMPEZA"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Status inválido" }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;

    const updated = await prisma.quarto.update({
      where: { id },
      data: updateData,
      include: {
        pacientes: {
          where: { status: "ATIVO", deletedAt: null },
          select: { id: true, nome: true },
        },
      },
    });

    await logAudit(session.userId, "UPDATE", "Quarto", id, {
      oldStatus: quarto.status,
      newStatus: body.status,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/quartos/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar quarto" }, { status: 500 });
  }
}
