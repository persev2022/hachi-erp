import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET: Get messages for a specific contact (phone number)
 * Returns all messages in chronological order for the chat view.
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

    const { searchParams } = new URL(req.url);
    const telefone = searchParams.get("telefone");

    if (!telefone) {
      return NextResponse.json({ success: false, error: "Telefone é obrigatório" }, { status: 400 });
    }

    const mensagens = await prisma.comunicacao.findMany({
      where: {
        tenantId,
        destinatario: telefone,
        canal: "WHATSAPP",
      },
      include: {
        paciente: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: mensagens.map((m) => ({
        id: m.id,
        mensagem: m.mensagem,
        status: m.status,
        direcao: m.assunto === "RECEBIDA" ? "recebida" : "enviada",
        createdAt: m.createdAt.toISOString(),
        paciente: m.paciente,
      })),
    });
  } catch (error) {
    console.error("GET /api/comunicacao/mensagens error:", error);
    return NextResponse.json({ success: false, error: "Erro ao carregar mensagens" }, { status: 500 });
  }
}
