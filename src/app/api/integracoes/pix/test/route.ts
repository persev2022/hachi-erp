import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { testarConexao } from "@/lib/integrations/pix/client";

/**
 * POST: Test Pix (Sicredi) API connection.
 * Tries to obtain an OAuth token — if successful, credentials are valid.
 */
export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    await testarConexao();
    return NextResponse.json({ success: true, message: "Conexão com Sicredi Pix OK!" });
  } catch (error: any) {
    const detail = error?.response?.data
      ? JSON.stringify(error.response.data).slice(0, 200)
      : error.message || "Erro desconhecido";
    return NextResponse.json(
      { error: `Falha na conexão: ${detail}` },
      { status: 400 }
    );
  }
}
