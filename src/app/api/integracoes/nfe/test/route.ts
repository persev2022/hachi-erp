import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const apiKey = process.env.NFE_API_KEY;
    const companyId = process.env.NFE_COMPANY_ID;
    const baseURL = process.env.NFE_BASE_URL || "https://api.nfe.io";

    if (!apiKey || !companyId) {
      return NextResponse.json(
        { error: "API Key e Company ID não configurados" },
        { status: 400 }
      );
    }

    // Test: fetch company info
    const response = await fetch(`${baseURL}/v1/companies/${companyId}`, {
      method: "GET",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Conexão com nfe.io OK" });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Falha na conexão: ${response.status} - ${errorText}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erro ao testar NF-e:", error);
    return NextResponse.json(
      { error: "Erro ao conectar com nfe.io" },
      { status: 500 }
    );
  }
}
