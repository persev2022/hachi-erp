import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { validateAnamnese } from "@/modules/clinic/anamnese";
import type { Anamnese } from "@/modules/clinic/anamnese";

/**
 * POST /api/clinic/anamnese
 *
 * Create/update anamnese for a patient.
 * Stores as a Documento with tipo "OUTRO" and titulo "Anamnese".
 * The arquivo field stores the JSON stringified anamnese.
 *
 * Body: { pacienteId: string, anamnese: Anamnese }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    if (!session.tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant não configurado" },
        { status: 403 }
      );
    }

    // Verify tenant is clinic vertical
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { vertical: true },
    });

    if (!tenant || tenant.vertical !== "clinic") {
      return NextResponse.json(
        { success: false, error: "Recurso disponível apenas para a vertical Clinic" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { pacienteId, anamnese } = body as { pacienteId: string; anamnese: Anamnese };

    if (!pacienteId) {
      return NextResponse.json(
        { success: false, error: "pacienteId é obrigatório" },
        { status: 400 }
      );
    }

    if (!anamnese) {
      return NextResponse.json(
        { success: false, error: "anamnese é obrigatória" },
        { status: 400 }
      );
    }

    // Validate anamnese fields
    const validation = validateAnamnese(anamnese);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: "Validação falhou", details: validation.errors },
        { status: 400 }
      );
    }

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { id: true },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Store as Documento with tipo OUTRO and titulo "Anamnese"
    const documento = await prisma.documento.create({
      data: {
        pacienteId,
        tipo: "OUTRO",
        titulo: "Anamnese",
        arquivo: JSON.stringify(anamnese),
        formato: "json",
        geradoPor: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      documento: {
        id: documento.id,
        pacienteId: documento.pacienteId,
        tipo: documento.tipo,
        titulo: documento.titulo,
        anamnese,
        createdAt: documento.createdAt,
      },
    });
  } catch (error) {
    console.error("POST /api/clinic/anamnese error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
