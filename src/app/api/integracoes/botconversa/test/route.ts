import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * POST: Test BotConversa API connection.
 * The BotConversa API base URL is https://backend.botconversa.com.br/api/v1
 * We test by calling GET /subscriber?phone=0 — a valid key returns 200/404 (subscriber not found),
 * an invalid key returns 401/403.
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

    // Test with a subscriber lookup — verifies auth works
    const response = await fetch(
      "https://backend.botconversa.com.br/api/v1/subscriber/?phone=5500000000000",
      {
        method: "GET",
        headers: {
          "API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    // 401/403 = invalid key
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: "API Key inválida. Verifique a chave no painel do BotConversa." },
        { status: 400 }
      );
    }

    // 404 on subscriber = key is valid, just subscriber not found (expected)
    // 200 = key valid and subscriber found
    // Any 2xx or 404 = connection is working
    if (response.ok || response.status === 404) {
      return NextResponse.json({ success: true, message: "Conexão com BotConversa OK!" });
    }

    // Try alternative endpoint structure
    const altResponse = await fetch(
      "https://backend.botconversa.com.br/api/v1/webhook/",
      {
        method: "GET",
        headers: {
          "API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (altResponse.status === 401 || altResponse.status === 403) {
      return NextResponse.json(
        { error: "API Key inválida" },
        { status: 400 }
      );
    }

    if (altResponse.ok || altResponse.status === 404 || altResponse.status === 405) {
      return NextResponse.json({ success: true, message: "Conexão com BotConversa OK!" });
    }

    // If we get here, the API structure might have changed
    return NextResponse.json(
      { error: `Resposta inesperada (status ${response.status}). Verifique se a API Key está correta.` },
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
