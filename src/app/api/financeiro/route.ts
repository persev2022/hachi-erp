import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const createMovimentacaoSchema = z.object({
  pacienteId: z.string().uuid().optional(),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  categoria: z.enum([
    "MATRICULA",
    "MENSALIDADE",
    "MEDICAMENTO",
    "TRANSPORTE",
    "ALIMENTACAO",
    "LAVANDERIA",
    "EXAME",
    "PROCEDIMENTO",
    "OUTRO",
  ]),
  descricao: z.string().min(2, "Descrição é obrigatória"),
  valor: z.number().positive("Valor deve ser positivo"),
  dataVencimento: z.string().transform((s) => new Date(s)),
  formaPagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

// GET: List financial movements
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    // Only ADMIN, FINANCEIRO can access
    if (!["ADMIN", "FINANCEIRO", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");
    const tipo = searchParams.get("tipo");
    const status = searchParams.get("status");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    const where: any = {};

    if (pacienteId) where.pacienteId = pacienteId;
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;

    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) where.dataVencimento.gte = new Date(dataInicio);
      if (dataFim) where.dataVencimento.lte = new Date(dataFim + "T23:59:59");
    }

    const total = await prisma.movimentacaoFinanceira.count({ where });

    const movimentacoes = await prisma.movimentacaoFinanceira.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true } },
      },
      orderBy: { dataVencimento: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Summary totals
    const totais = await prisma.movimentacaoFinanceira.groupBy({
      by: ["tipo"],
      where,
      _sum: { valor: true },
    });

    const resumo = {
      totalReceitas: totais.find((t) => t.tipo === "RECEITA")?._sum.valor || 0,
      totalDespesas: totais.find((t) => t.tipo === "DESPESA")?._sum.valor || 0,
    };

    return NextResponse.json({
      success: true,
      data: movimentacoes,
      resumo,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("GET /api/financeiro error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar movimentações" }, { status: 500 });
  }
}

// POST: Create financial movement
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "FINANCEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createMovimentacaoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify patient exists if provided
    if (parsed.data.pacienteId) {
      const paciente = await prisma.paciente.findUnique({
        where: { id: parsed.data.pacienteId, deletedAt: null },
      });
      if (!paciente) {
        return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
      }
    }

    const movimentacao = await prisma.movimentacaoFinanceira.create({
      data: {
        pacienteId: parsed.data.pacienteId || null,
        tipo: parsed.data.tipo,
        categoria: parsed.data.categoria,
        descricao: parsed.data.descricao,
        valor: parsed.data.valor,
        dataVencimento: parsed.data.dataVencimento,
        formaPagamento: parsed.data.formaPagamento,
        observacoes: parsed.data.observacoes,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
      },
    });

    await logAudit(session.userId, "CREATE", "MovimentacaoFinanceira", movimentacao.id, {
      tipo: parsed.data.tipo,
      valor: parsed.data.valor,
      categoria: parsed.data.categoria,
    });

    return NextResponse.json({ success: true, data: movimentacao }, { status: 201 });
  } catch (error) {
    console.error("POST /api/financeiro error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar movimentação" }, { status: 500 });
  }
}
