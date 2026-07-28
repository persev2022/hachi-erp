import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const altaSchema = z.object({
  motivo: z.enum(["ALTA", "EVADIDO", "TRANSFERIDO", "OBITO"]),
  observacoes: z.string().min(1, "Motivo/observação é obrigatório"),
});

// POST: Dar alta/baixa no paciente — atualiza status, desvincula quarto e libera vaga
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const tenantId = session.tenantId;
    const { id } = await params;
    const body = await req.json();
    const parsed = altaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { motivo, observacoes } = parsed.data;

    // Find the patient
    const paciente = await prisma.paciente.findUnique({
      where: { id, deletedAt: null },
      include: { quarto: true },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Tenant isolation
    if (tenantId && paciente.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Cannot discharge if already not active
    if (paciente.status !== "ATIVO") {
      return NextResponse.json(
        { success: false, error: "Paciente já não está ativo" },
        { status: 400 }
      );
    }

    const quartoId = paciente.quartoId;

    // Use transaction to update patient and release room atomically
    await prisma.$transaction(async (tx) => {
      // 1. Update patient status, set discharge date, remove room assignment
      await tx.paciente.update({
        where: { id },
        data: {
          status: motivo,
          dataAlta: new Date(),
          quartoId: null,
        },
      });

      // 2. If patient had a room, check if it should be set to available
      if (quartoId) {
        // Count remaining active patients in this room
        const remainingPatients = await tx.paciente.count({
          where: {
            quartoId,
            id: { not: id },
            status: "ATIVO",
            deletedAt: null,
          },
        });

        // If no more active patients, set room to available
        if (remainingPatients === 0) {
          await tx.quarto.update({
            where: { id: quartoId },
            data: { status: "DISPONIVEL" },
          });
        }
      }
    });

    // Audit log
    await logAudit(session.userId, "UPDATE", "Paciente", id, {
      action: "ALTA",
      motivo,
      observacoes,
      quartoLiberado: quartoId || null,
    });

    return NextResponse.json({
      success: true,
      message: `Baixa registrada com sucesso. ${quartoId ? "Quarto liberado." : ""}`,
    });
  } catch (error) {
    console.error("POST /api/pacientes/[id]/alta error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao registrar baixa" },
      { status: 500 }
    );
  }
}
