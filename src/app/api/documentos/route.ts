import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: List documents for a patient
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");

    if (!pacienteId) {
      return NextResponse.json(
        { success: false, error: "pacienteId é obrigatório" },
        { status: 400 }
      );
    }

    const documentos = await prisma.documento.findMany({
      where: { pacienteId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: documentos });
  } catch (error) {
    console.error("GET /api/documentos error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar documentos" }, { status: 500 });
  }
}
