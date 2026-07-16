import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const createItemSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  categoria: z.enum([
    "MEDICAMENTO",
    "MATERIAL_HOSPITALAR",
    "HIGIENE",
    "LIMPEZA",
    "ALIMENTO",
    "EQUIPAMENTO",
    "ROUPA_CAMA",
    "OUTRO",
  ]),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  quantidade: z.number().int().min(0).default(0),
  minimo: z.number().int().min(0).default(5),
  validade: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  localizacao: z.string().optional(),
  fornecedor: z.string().optional(),
});

// GET: List stock items with filters and alerts
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoria = searchParams.get("categoria");
    const alertas = searchParams.get("alertas"); // "true" to show only items below minimum

    const where: any = {};

    // Tenant isolation
    if (!session.tenantId) { return NextResponse.json({ success: true, data: [] }); }
    if (session.tenantId) {
      where.tenantId = session.tenantId;
    }

    if (search) {
      where.nome = { contains: search, mode: "insensitive" };
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (alertas === "true") {
      where.quantidade = { lte: prisma.itemEstoque.fields?.minimo } as any;
      // Prisma doesn't support field comparison directly, use raw approach
      // We'll filter in code instead
    }

    const items = await prisma.itemEstoque.findMany({
      where: alertas === "true" ? { ...where, quantidade: undefined } : where,
      orderBy: [{ categoria: "asc" }, { nome: "asc" }],
    });

    // Filter alerts in code (items below minimum)
    const filtered = alertas === "true"
      ? items.filter((item) => item.quantidade <= item.minimo)
      : items;

    const alertCount = items.filter((item) => item.quantidade <= item.minimo).length;

    return NextResponse.json({
      success: true,
      data: filtered,
      meta: { total: filtered.length, alertas: alertCount },
    });
  } catch (error) {
    console.error("GET /api/estoque error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar estoque" }, { status: 500 });
  }
}

// POST: Create stock item
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const item = await prisma.itemEstoque.create({
      data: {
        nome: parsed.data.nome,
        categoria: parsed.data.categoria,
        unidade: parsed.data.unidade,
        quantidade: parsed.data.quantidade,
        minimo: parsed.data.minimo,
        validade: parsed.data.validade || null,
        localizacao: parsed.data.localizacao,
        fornecedor: parsed.data.fornecedor,
        ...(session.tenantId ? { tenantId: session.tenantId } : {}),
      },
    });

    await logAudit(session.userId, "CREATE", "ItemEstoque", item.id, {
      nome: parsed.data.nome,
      categoria: parsed.data.categoria,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/estoque error:", error);
    return NextResponse.json({ success: false, error: "Erro ao criar item" }, { status: 500 });
  }
}
