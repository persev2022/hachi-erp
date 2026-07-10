import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// GET: Single item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const tenantId = session.tenantId;
    const { id } = await params;

    const item = await prisma.itemEstoque.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ success: false, error: "Item não encontrado" }, { status: 404 });
    }

    // Tenant isolation: verify item belongs to tenant
    if (tenantId && item.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Item não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/estoque/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar item" }, { status: 500 });
  }
}

// PUT: Update item (quantity, data)
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

    const item = await prisma.itemEstoque.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ success: false, error: "Item não encontrado" }, { status: 404 });
    }

    // Tenant isolation: verify item belongs to tenant
    if (session.tenantId && item.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Item não encontrado" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.nome) updateData.nome = body.nome;
    if (body.categoria) updateData.categoria = body.categoria;
    if (body.unidade) updateData.unidade = body.unidade;
    if (body.quantidade !== undefined) updateData.quantidade = body.quantidade;
    if (body.minimo !== undefined) updateData.minimo = body.minimo;
    if (body.validade !== undefined) updateData.validade = body.validade ? new Date(body.validade) : null;
    if (body.localizacao !== undefined) updateData.localizacao = body.localizacao;
    if (body.fornecedor !== undefined) updateData.fornecedor = body.fornecedor;

    // Support movimentacao (add/subtract quantity)
    if (body.movimentacao) {
      const { tipo, quantidade: qty } = body.movimentacao;
      if (tipo === "entrada") {
        updateData.quantidade = item.quantidade + (qty || 0);
      } else if (tipo === "saida") {
        const newQty = item.quantidade - (qty || 0);
        if (newQty < 0) {
          return NextResponse.json(
            { success: false, error: "Quantidade insuficiente em estoque" },
            { status: 400 }
          );
        }
        updateData.quantidade = newQty;
      }
    }

    const updated = await prisma.itemEstoque.update({
      where: { id },
      data: updateData,
    });

    await logAudit(session.userId, "UPDATE", "ItemEstoque", id, {
      fields: Object.keys(updateData),
      movimentacao: body.movimentacao || null,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/estoque/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar item" }, { status: 500 });
  }
}
