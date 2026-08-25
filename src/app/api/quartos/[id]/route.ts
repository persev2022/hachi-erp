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
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

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

// PUT: Update room (status, numero, tipo, capacidade, andar, observacoes)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const quarto = await prisma.quarto.findUnique({ where: { id } });
    if (!quarto || quarto.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Quarto não encontrado" }, { status: 404 });
    }

    const updateData: any = {};

    // Status update
    if (body.status) {
      const validStatuses = ["DISPONIVEL", "OCUPADO", "MANUTENCAO", "LIMPEZA"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Status inválido" }, { status: 400 });
      }
      updateData.status = body.status;
    }

    // Full edit fields
    if (body.numero !== undefined) updateData.numero = body.numero;
    if (body.tipo !== undefined) updateData.tipo = body.tipo || null;
    if (body.capacidade !== undefined) updateData.capacidade = Math.max(1, parseInt(body.capacidade) || 1);
    if (body.andar !== undefined) updateData.andar = parseInt(body.andar) || 1;
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes || null;

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
      fields: Object.keys(updateData),
      oldStatus: quarto.status,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/quartos/[id] error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Número de quarto já existe" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Erro ao atualizar quarto" }, { status: 500 });
  }
}

// DELETE: Remove a room (only if empty)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    const quarto = await prisma.quarto.findUnique({
      where: { id },
      include: { pacientes: { where: { status: "ATIVO", deletedAt: null } } },
    });

    if (!quarto || quarto.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Quarto não encontrado" }, { status: 404 });
    }

    if (quarto.pacientes.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Não é possível excluir: ${quarto.pacientes.length} paciente(s) ocupando este quarto. Transfira-os primeiro.`,
      }, { status: 400 });
    }

    await prisma.quarto.delete({ where: { id } });

    await logAudit(session.userId, "DELETE", "Quarto", id, {
      numero: quarto.numero,
      tipo: quarto.tipo,
    });

    return NextResponse.json({ success: true, message: `Quarto ${quarto.numero} removido` });
  } catch (error) {
    console.error("DELETE /api/quartos/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao remover quarto" }, { status: 500 });
  }
}
