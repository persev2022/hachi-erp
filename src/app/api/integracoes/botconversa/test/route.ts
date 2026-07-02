import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

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

    // Test the connection by listing flows
    const response = await fetch(
      "https://backend.botconversa.com.br/api/v1/flow/list",
      {
        method: "GET",
        headers: {
          "API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Conexão OK" });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Falha na conexão: ${response.status} - ${errorText}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erro ao testar BotConversa:", error);
    return NextResponse.json(
      { error: "Erro ao conectar com BotConversa" },
      { status: 500 }
    );
  }
}
