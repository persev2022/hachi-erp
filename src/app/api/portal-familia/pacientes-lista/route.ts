import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Public list of active patient names for family registration.
 * Only returns id + nome (no sensitive data).
 */
export async function GET() {
  try {
    const pacientes = await prisma.paciente.findMany({
      where: { status: "ATIVO", deletedAt: null },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json({ success: true, data: pacientes });
  } catch (error) {
    console.error("GET /api/portal-familia/pacientes-lista error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
