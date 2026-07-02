import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: List rooms with optional status filter
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const quartos = await prisma.quarto.findMany({
      where,
      include: {
        pacientes: {
          where: { status: "ATIVO", deletedAt: null },
          select: { id: true, nome: true },
        },
      },
      orderBy: { numero: "asc" },
    });

    return NextResponse.json({ success: true, data: quartos });
  } catch (error) {
    console.error("GET /api/quartos error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar quartos" }, { status: 500 });
  }
}
