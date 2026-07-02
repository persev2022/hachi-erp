import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * POST: Test BotConversa API connection.
 * Base URL: https://backend.botconversa.com.br/api/v1/webhook
 * Uses GET /flows/ to verify the key works (lists available flows).
 */
export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = (body as { apiKey?: string }).apiKey || process.env.BOTCONVERSA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key não configurada" },
        { status: 400 }
      );
    }

    // Test with GET /flows/ — lists available flows
    const response = await fetch(
      "https://backend.botconversa.com.br/api/v1/webhook/flows/",
      {
        method: "GET",
        headers: {
          "API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: "API Key inválida. Verifique a chave no painel do BotConversa." },
        { status: 400 }
      );
    }

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Conexão com BotConversa OK!" });
    }

    // Fallback: try /tags/ endpoint
    const fallback = await fetch(
      "https://backend.botconversa.com.br/api/v1/webhook/tags/",
      {
        method: "GET",
        headers: { "API-KEY": apiKey },
      }
    );

    if (fallback.status === 401 || fallback.status === 403) {
      return NextResponse.json({ error: "API Key inválida" }, { status: 400 });
    }

    if (fallback.ok) {
      return NextResponse.json({ success: true, message: "Conexão com BotConversa OK!" });
    }

    return NextResponse.json(
      { error: `Resposta inesperada (status ${response.status})` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erro ao testar BotConversa:", error);
    return NextResponse.json(
      { error: `Erro de rede: ${error.message || "não foi possível conectar"}` },
      { status: 500 }
    );
  }
}
