import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// GET: Single financial movement
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "FINANCEIRO", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    const { id } = await params;

    const movimentacao = await prisma.movimentacaoFinanceira.findUnique({
      where: { id },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true } },
      },
    });

    if (!movimentacao) {
      return NextResponse.json({ success: false, error: "Movimentação não encontrada" }, { status: 404 });
    }

    // Tenant isolation: verify movement belongs to tenant
    if (tenantId && movimentacao.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Movimentação não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: movimentacao });
  } catch (error) {
    console.error("GET /api/financeiro/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar movimentação" }, { status: 500 });
  }
}

// PUT: Update status (pay, cancel)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "FINANCEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const movimentacao = await prisma.movimentacaoFinanceira.findUnique({ where: { id } });

    if (!movimentacao) {
      return NextResponse.json({ success: false, error: "Movimentação não encontrada" }, { status: 404 });
    }

    // Tenant isolation: verify movement belongs to tenant
    if (session.tenantId && movimentacao.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Movimentação não encontrada" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.status) {
      const allowedTransitions: Record<string, string[]> = {
        PENDENTE: ["PAGO", "CANCELADO"],
        ATRASADO: ["PAGO", "CANCELADO"],
      };

      const allowed = allowedTransitions[movimentacao.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: `Transição inválida: ${movimentacao.status} → ${body.status}` },
          { status: 400 }
        );
      }

      updateData.status = body.status;

      if (body.status === "PAGO") {
        updateData.dataPagamento = new Date();
        if (body.formaPagamento) updateData.formaPagamento = body.formaPagamento;
      }
    }

    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;

    const updated = await prisma.movimentacaoFinanceira.update({
      where: { id },
      data: updateData,
      include: {
        paciente: { select: { id: true, nome: true } },
      },
    });

    await logAudit(session.userId, "UPDATE", "MovimentacaoFinanceira", id, {
      oldStatus: movimentacao.status,
      newStatus: body.status,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/financeiro/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar movimentação" }, { status: 500 });
  }
}
