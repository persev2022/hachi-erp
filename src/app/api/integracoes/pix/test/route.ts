import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import axios from "axios";

/**
 * POST: Test Pix (Sicredi) API connection.
 * Accepts credentials in body OR reads from database.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      clientId?: string;
      clientSecret?: string;
      environment?: string;
    };

    // Use credentials from body (pre-save test) or fall back to env/DB
    let clientId = body.clientId || process.env.PIX_CLIENT_ID || "";
    let clientSecret = body.clientSecret || process.env.PIX_CLIENT_SECRET || "";
    let baseURL = (body.environment === "production")
      ? "https://api-parceiro.sicredi.com.br"
      : "https://api-parceiro.sicredi.com.br/sb";

    // If not in body or env, try database
    if (!clientId || !clientSecret) {
      const { prisma } = await import("@/lib/prisma");
      const config = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
      if (config) {
        try {
          const settings = JSON.parse(config.value);
          if (settings.pix?.clientId) clientId = settings.pix.clientId;
          if (settings.pix?.clientSecret) clientSecret = settings.pix.clientSecret;
          if (settings.pix?.environment) {
            baseURL = settings.pix.environment === "production"
              ? "https://api-parceiro.sicredi.com.br"
              : "https://api-parceiro.sicredi.com.br/sb";
          }
        } catch {}
      }
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Preencha Client ID e Client Secret e salve antes de testar." },
        { status: 400 }
      );
    }

    // Try to get OAuth token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post(
      `${baseURL}/oauth/token`,
      "grant_type=client_credentials&scope=cob.write cob.read pix.read pix.write",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );

    if (response.data?.access_token) {
      return NextResponse.json({
        success: true,
        message: "Conexão com Sicredi Pix OK! Token obtido com sucesso.",
      });
    }

    return NextResponse.json({ error: "Resposta inesperada do Sicredi" }, { status: 400 });
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 401) {
      return NextResponse.json(
        { error: "Client ID ou Client Secret inválidos. Verifique no portal Sicredi." },
        { status: 400 }
      );
    }

    if (status === 403) {
      return NextResponse.json(
        { error: "Acesso negado pelo Sicredi. Verifique se a aplicação tem permissão para API Pix." },
        { status: 400 }
      );
    }

    const detail = data
      ? JSON.stringify(data).slice(0, 200)
      : error.message || "Erro desconhecido";

    return NextResponse.json(
      { error: `Falha na conexão: ${detail}` },
      { status: 400 }
    );
  }
}
