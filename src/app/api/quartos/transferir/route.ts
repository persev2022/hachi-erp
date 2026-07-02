import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const transferirSchema = z.object({
  pacienteId: z.string().uuid(),
  quartoDestinoId: z.string().uuid(),
});

// POST: Transfer patient to another room (check-in/check-out)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = transferirSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pacienteId, quartoDestinoId } = parsed.data;

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, deletedAt: null },
    });
    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    // Verify destination room exists and is available
    const quartoDestino = await prisma.quarto.findUnique({ where: { id: quartoDestinoId } });
    if (!quartoDestino) {
      return NextResponse.json({ success: false, error: "Quarto destino não encontrado" }, { status: 404 });
    }

    if (quartoDestino.status !== "DISPONIVEL") {
      return NextResponse.json(
        { success: false, error: "Quarto destino não está disponível" },
        { status: 400 }
      );
    }

    // Transaction: free old room, assign new room
    await prisma.$transaction(async (tx) => {
      // Free old room if exists
      if (paciente.quartoId) {
        const oldRoomPatients = await tx.paciente.count({
          where: { quartoId: paciente.quartoId, status: "ATIVO", deletedAt: null, id: { not: pacienteId } },
        });
        if (oldRoomPatients === 0) {
          await tx.quarto.update({
            where: { id: paciente.quartoId },
            data: { status: "LIMPEZA" },
          });
        }
      }

      // Assign patient to new room
      await tx.paciente.update({
        where: { id: pacienteId },
        data: { quartoId: quartoDestinoId },
      });

      // Mark new room as occupied
      await tx.quarto.update({
        where: { id: quartoDestinoId },
        data: { status: "OCUPADO" },
      });
    });

    await logAudit(session.userId, "TRANSFER", "Quarto", quartoDestinoId, {
      pacienteId,
      from: paciente.quartoId,
      to: quartoDestinoId,
    });

    return NextResponse.json({
      success: true,
      message: `Paciente transferido para quarto ${quartoDestino.numero}`,
    });
  } catch (error) {
    console.error("POST /api/quartos/transferir error:", error);
    return NextResponse.json({ success: false, error: "Erro ao transferir" }, { status: 500 });
  }
}
