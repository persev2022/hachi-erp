import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import * as nvidia from "@/lib/ai/nvidia";

/**
 * POST /api/ia/busca
 * Semantic search across evolutions using NVIDIA embeddings + reranking.
 * If NVIDIA not available, falls back to text search.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const { query, pacienteId } = await req.json();
    if (!query) return NextResponse.json({ success: false, error: "Query obrigatória" }, { status: 400 });

    const tenantId = session.tenantId;
    const where: any = {};
    if (tenantId) where.paciente = { tenantId };
    if (pacienteId) where.pacienteId = pacienteId;

    // Get evolutions
    const evolucoes = await prisma.evolucao.findMany({
      where,
      include: { paciente: { select: { nome: true } }, profissional: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (evolucoes.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // If NVIDIA available, use semantic reranking
    if (nvidia.isAvailable()) {
      try {
        const passages = evolucoes.map((e) => `[${e.tipo}] ${e.paciente.nome} - ${e.conteudo.slice(0, 200)}`);
        const rankings = await nvidia.rerank(query, passages.slice(0, 20));
        
        const sorted = rankings
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map((r) => ({
            ...evolucoes[r.index],
            relevanceScore: Math.round(r.score * 100),
          }));

        return NextResponse.json({ success: true, data: sorted, method: "semantic" });
      } catch (err) {
        console.error("NVIDIA rerank failed, falling back to text search:", err);
      }
    }

    // Fallback: simple text search
    const terms = query.toLowerCase().split(" ");
    const filtered = evolucoes
      .filter((e) => terms.some((t: string) => e.conteudo.toLowerCase().includes(t) || e.paciente.nome.toLowerCase().includes(t) || e.tipo.toLowerCase().includes(t)))
      .slice(0, 10);

    return NextResponse.json({ success: true, data: filtered, method: "text" });
  } catch (error) {
    console.error("POST /api/ia/busca error:", error);
    return NextResponse.json({ success: false, error: "Erro na busca" }, { status: 500 });
  }
}
