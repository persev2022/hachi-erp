import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import * as nvidia from "@/lib/ai/nvidia";

/**
 * POST /api/ia/analisar-documento
 * Analyze document/image using NVIDIA Vision model.
 * Reads prescriptions, lab results, certificates, etc.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    if (!nvidia.isAvailable()) {
      return NextResponse.json({ success: false, error: "NVIDIA API não configurada" }, { status: 400 });
    }

    const { imageBase64, question } = await req.json();
    if (!imageBase64) return NextResponse.json({ success: false, error: "Imagem obrigatória" }, { status: 400 });

    const defaultQuestion = question || "Leia este documento e extraia todas as informações relevantes. Se for uma receita médica, liste os medicamentos. Se for um exame, liste os resultados. Responda em português.";

    const result = await nvidia.analyzeImage(imageBase64, defaultQuestion);

    return NextResponse.json({ success: true, data: { analysis: result } });
  } catch (error: any) {
    console.error("POST /api/ia/analisar-documento error:", error);
    return NextResponse.json({ success: false, error: error.message || "Erro ao analisar documento" }, { status: 500 });
  }
}
