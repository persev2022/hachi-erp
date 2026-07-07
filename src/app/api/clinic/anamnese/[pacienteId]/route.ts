import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/clinic/anamnese/:pacienteId
 *
 * Returns the latest anamnese for a patient.
 * Fetches from Documento with titulo "Anamnese", ordered by createdAt desc.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pacienteId: string }> }
) {
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

    const { pacienteId } = await params;

    if (!pacienteId) {
      return NextResponse.json(
        { success: false, error: "pacienteId é obrigatório" },
        { status: 400 }
      );
    }

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { id: true, nome: true },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Find latest anamnese document
    const documento = await prisma.documento.findFirst({
      where: {
        pacienteId,
        titulo: "Anamnese",
        tipo: "OUTRO",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!documento) {
      return NextResponse.json({
        success: true,
        anamnese: null,
        message: "Nenhuma anamnese registrada para este paciente",
      });
    }

    // Parse the stored JSON anamnese
    let anamnese = null;
    try {
      anamnese = JSON.parse(documento.arquivo);
    } catch {
      return NextResponse.json(
        { success: false, error: "Erro ao parsear anamnese armazenada" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documento: {
        id: documento.id,
        createdAt: documento.createdAt,
        geradoPor: documento.geradoPor,
      },
      paciente: {
        id: paciente.id,
        nome: paciente.nome,
      },
      anamnese,
    });
  } catch (error) {
    console.error("GET /api/clinic/anamnese/[pacienteId] error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
