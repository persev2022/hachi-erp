import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import * as nvidia from "@/lib/ai/nvidia";

/**
 * POST /api/ia/resumir
 * Summarize patient evolutions or generate clinical report using AI.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    if (!nvidia.isAvailable()) {
      return NextResponse.json({ success: false, error: "NVIDIA API não configurada" }, { status: 400 });
    }

    const { pacienteId, tipo } = await req.json();

    if (tipo === "evolucoes" && pacienteId) {
      // Summarize patient evolutions
      const evolucoes = await prisma.evolucao.findMany({
        where: { pacienteId },
        include: { profissional: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId }, select: { nome: true } });

      if (evolucoes.length === 0) {
        return NextResponse.json({ success: true, data: { summary: "Nenhuma evolução para resumir." } });
      }

      const texts = evolucoes.map((e) => `[${new Date(e.createdAt).toLocaleDateString("pt-BR")} - ${e.tipo} - ${e.profissional.name}]: ${e.conteudo}`);

      const summary = await nvidia.generateClinicalInsight(texts, paciente?.nome || "Paciente");
      return NextResponse.json({ success: true, data: { summary } });
    }

    if (tipo === "financeiro") {
      // Summarize financial data
      const tenantId = session.tenantId;
      const now = new Date();
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const [rec, desp] = await Promise.all([
          prisma.movimentacaoFinanceira.aggregate({ where: { tenantId: tenantId!, tipo: "RECEITA", status: "PAGO", dataPagamento: { gte: start, lte: end } }, _sum: { valor: true } }),
          prisma.movimentacaoFinanceira.aggregate({ where: { tenantId: tenantId!, tipo: "DESPESA", dataVencimento: { gte: start, lte: end } }, _sum: { valor: true } }),
        ]);
        data.push({ mes: start.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }), receita: rec._sum.valor || 0, despesa: desp._sum.valor || 0 });
      }

      const prediction = await nvidia.predictRevenue(data);
      return NextResponse.json({ success: true, data: { summary: prediction } });
    }

    return NextResponse.json({ success: false, error: "Tipo não suportado" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/ia/resumir error:", error);
    return NextResponse.json({ success: false, error: error.message || "Erro" }, { status: 500 });
  }
}
