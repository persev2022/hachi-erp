import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const dispensarSchema = z.object({
  itemId: z.string().uuid(),
  pacienteId: z.string().uuid().optional().nullable(),
  quantidade: z.number().int().positive("Quantidade deve ser positiva"),
  dosagem: z.string().optional(),
  observacoes: z.string().optional(),
});

/**
 * POST /api/estoque/dispensar
 * Dispensa medicamento para um acolhido (dá baixa no estoque e registra a movimentação).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "COORDENADOR", "ENFERMEIRO", "MEDICO", "MONITOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Tenant não identificado" }, { status: 400 });

    const body = await req.json();
    const parsed = dispensarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { itemId, pacienteId, quantidade, dosagem, observacoes } = parsed.data;

    // Verify item exists and belongs to tenant
    const item = await prisma.itemEstoque.findUnique({ where: { id: itemId } });
    if (!item || item.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Item não encontrado" }, { status: 404 });
    }

    if (item.quantidade < quantidade) {
      return NextResponse.json({ success: false, error: `Estoque insuficiente. Disponível: ${item.quantidade} ${item.unidade}` }, { status: 400 });
    }

    // Verify patient if provided
    let pacienteNome = "";
    if (pacienteId) {
      const pac = await prisma.paciente.findFirst({ where: { id: pacienteId, tenantId, deletedAt: null }, select: { nome: true } });
      if (!pac) return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
      pacienteNome = pac.nome;
    }

    // Transaction: decrement stock + create dispensation record
    const [, dispensacao] = await prisma.$transaction([
      prisma.itemEstoque.update({ where: { id: itemId }, data: { quantidade: { decrement: quantidade } } }),
      prisma.dispensacaoMedicamento.create({
        data: {
          itemId,
          pacienteId: pacienteId || null,
          tipo: "DISPENSACAO",
          quantidade,
          dosagem: dosagem || null,
          observacoes: observacoes || null,
          dispensadoPor: session.userId,
          tenantId,
        },
      }),
    ]);

    await logAudit(session.userId, "DISPENSE", "ItemEstoque", itemId, {
      medicamento: item.nome,
      quantidade,
      paciente: pacienteNome || "estoque geral",
    });

    return NextResponse.json({
      success: true,
      data: dispensacao,
      message: `${quantidade} ${item.unidade} de ${item.nome} dispensado${pacienteNome ? ` para ${pacienteNome}` : ""}.`,
    });
  } catch (error) {
    console.error("POST /api/estoque/dispensar error:", error);
    return NextResponse.json({ success: false, error: "Erro ao dispensar" }, { status: 500 });
  }
}

/**
 * GET /api/estoque/dispensar?pacienteId=xxx  → histórico de dispensação de um acolhido
 * GET /api/estoque/dispensar?resumo=true     → resumo por acolhido (quanto cada um recebeu)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: [] });

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");
    const resumo = searchParams.get("resumo") === "true";
    const itemId = searchParams.get("itemId");

    const where: any = { tenantId, tipo: "DISPENSACAO" };
    if (pacienteId) where.pacienteId = pacienteId;
    if (itemId) where.itemId = itemId;

    const dispensacoes = await prisma.dispensacaoMedicamento.findMany({
      where,
      include: {
        item: { select: { nome: true, unidade: true, categoria: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    if (resumo) {
      // Group by patient + medication: total dispensed to each
      const pacientes = await prisma.paciente.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, nome: true },
      });
      const pacMap = Object.fromEntries(pacientes.map(p => [p.id, p.nome]));

      const porPaciente: Record<string, { nome: string; medicamentos: Record<string, { total: number; unidade: string; ultimaData: string }> }> = {};
      for (const d of dispensacoes) {
        if (!d.pacienteId) continue;
        const nome = pacMap[d.pacienteId] || "Desconhecido";
        if (!porPaciente[d.pacienteId]) porPaciente[d.pacienteId] = { nome, medicamentos: {} };
        const med = d.item.nome;
        if (!porPaciente[d.pacienteId].medicamentos[med]) {
          porPaciente[d.pacienteId].medicamentos[med] = { total: 0, unidade: d.item.unidade, ultimaData: d.createdAt.toISOString() };
        }
        porPaciente[d.pacienteId].medicamentos[med].total += d.quantidade;
      }

      const resumoArr = Object.entries(porPaciente).map(([id, d]) => ({
        pacienteId: id,
        nome: d.nome,
        medicamentos: Object.entries(d.medicamentos).map(([nome, m]) => ({ nome, ...m })),
        totalDispensacoes: Object.values(d.medicamentos).reduce((s, m) => s + m.total, 0),
      })).sort((a, b) => b.totalDispensacoes - a.totalDispensacoes);

      return NextResponse.json({ success: true, data: resumoArr });
    }

    // Get patient names for the list
    const pacIds = [...new Set(dispensacoes.map(d => d.pacienteId).filter(Boolean))] as string[];
    const pacs = await prisma.paciente.findMany({ where: { id: { in: pacIds } }, select: { id: true, nome: true } });
    const pacMap = Object.fromEntries(pacs.map(p => [p.id, p.nome]));

    return NextResponse.json({
      success: true,
      data: dispensacoes.map(d => ({
        id: d.id,
        data: d.createdAt.toISOString(),
        medicamento: d.item.nome,
        unidade: d.item.unidade,
        quantidade: d.quantidade,
        dosagem: d.dosagem,
        observacoes: d.observacoes,
        paciente: d.pacienteId ? (pacMap[d.pacienteId] || "—") : "Estoque geral",
        pacienteId: d.pacienteId,
      })),
    });
  } catch (error) {
    console.error("GET /api/estoque/dispensar error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
