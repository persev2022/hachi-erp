import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { CLINIC_APPOINTMENT_TYPES, CONVENIOS } from "@/modules/clinic/appointments";

/**
 * GET /api/clinic/appointment-types
 *
 * Returns available appointment types and convênios for the Clinic vertical.
 * Requires the user's tenant to have vertical="clinic", otherwise returns 403.
 */
export async function GET(req: NextRequest) {
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

    return NextResponse.json({
      success: true,
      appointmentTypes: CLINIC_APPOINTMENT_TYPES,
      convenios: CONVENIOS,
    });
  } catch (error) {
    console.error("GET /api/clinic/appointment-types error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
