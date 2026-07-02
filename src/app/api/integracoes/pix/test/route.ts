import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const clientId = process.env.PIX_CLIENT_ID;
    const clientSecret = process.env.PIX_CLIENT_SECRET;
    const baseURL = process.env.PIX_BASE_URL || "https://pix-h.api.efipay.com.br";

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Client ID e Client Secret não configurados" },
        { status: 400 }
      );
    }

    // Test: try to get an OAuth token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${baseURL}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grant_type: "client_credentials" }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Conexão OAuth OK" });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Falha na autenticação: ${response.status} - ${errorText}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erro ao testar Pix:", error);
    return NextResponse.json(
      { error: "Erro ao conectar com EFI/Pix" },
      { status: 500 }
    );
  }
}
