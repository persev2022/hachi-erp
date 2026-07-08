import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: List rooms with auto-sync of occupancy status
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
    if (session.tenantId) where.tenantId = session.tenantId;

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

    // Auto-sync: if a room has active patients but status is not OCUPADO, fix it
    // Also if a room has no patients but is marked OCUPADO, fix it
    const updates: Promise<any>[] = [];
    for (const quarto of quartos) {
      const hasPatients = quarto.pacientes.length > 0;
      if (hasPatients && quarto.status === "DISPONIVEL") {
        updates.push(
          prisma.quarto.update({ where: { id: quarto.id }, data: { status: "OCUPADO" } })
        );
        quarto.status = "OCUPADO";
      } else if (!hasPatients && quarto.status === "OCUPADO") {
        updates.push(
          prisma.quarto.update({ where: { id: quarto.id }, data: { status: "DISPONIVEL" } })
        );
        quarto.status = "DISPONIVEL";
      }
    }
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return NextResponse.json({ success: true, data: quartos });
  } catch (error) {
    console.error("GET /api/quartos error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar quartos" }, { status: 500 });
  }
}
