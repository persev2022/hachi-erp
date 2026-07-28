import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET: List conversations grouped by destinatario (contact phone)
 * Returns a list of unique contacts with their last message and unread count.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get all unique contacts with their messages
    const comunicacoes = await prisma.comunicacao.findMany({
      where: { tenantId, canal: "WHATSAPP" },
      include: { paciente: { select: { id: true, nome: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Group by destinatario
    const conversasMap = new Map<string, {
      telefone: string;
      paciente: { id: string; nome: string } | null;
      ultimaMensagem: string;
      ultimaData: string;
      ultimoStatus: string;
      totalMensagens: number;
      direcao: "enviada" | "recebida";
    }>();

    for (const msg of comunicacoes) {
      const key = msg.destinatario;
      if (!conversasMap.has(key)) {
        conversasMap.set(key, {
          telefone: msg.destinatario,
          paciente: msg.paciente,
          ultimaMensagem: msg.mensagem,
          ultimaData: msg.createdAt.toISOString(),
          ultimoStatus: msg.status,
          totalMensagens: 1,
          direcao: msg.assunto === "RECEBIDA" ? "recebida" : "enviada",
        });
      } else {
        const existing = conversasMap.get(key)!;
        existing.totalMensagens++;
        // Keep paciente reference if available
        if (!existing.paciente && msg.paciente) {
          existing.paciente = msg.paciente;
        }
      }
    }

    // Convert to array and sort by most recent
    const conversas = Array.from(conversasMap.values()).sort(
      (a, b) => new Date(b.ultimaData).getTime() - new Date(a.ultimaData).getTime()
    );

    return NextResponse.json({ success: true, data: conversas });
  } catch (error) {
    console.error("GET /api/comunicacao/conversas error:", error);
    return NextResponse.json({ success: false, error: "Erro ao carregar conversas" }, { status: 500 });
  }
}
