import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

/**
 * POST /api/quartos/transferir
 * Transfer a patient from one room to another.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const { pacienteId, quartoDestinoId } = await req.json();
    if (!pacienteId || !quartoDestinoId) {
      return NextResponse.json({ success: false, error: "pacienteId e quartoDestinoId são obrigatórios" }, { status: 400 });
    }

    // Verify patient
    const paciente = await prisma.paciente.findFirst({
      where: { id: pacienteId, deletedAt: null, ...(session.tenantId ? { tenantId: session.tenantId } : {}) },
    });
    if (!paciente) return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });

    // Verify destination room
    const destino = await prisma.quarto.findFirst({
      where: { id: quartoDestinoId, ...(session.tenantId ? { tenantId: session.tenantId } : {}) },
      include: { pacientes: { where: { status: "ATIVO", deletedAt: null } } },
    });
    if (!destino) return NextResponse.json({ success: false, error: "Quarto destino não encontrado" }, { status: 404 });

    // Check capacity
    if (destino.pacientes.length >= destino.capacidade) {
      return NextResponse.json({ success: false, error: `Quarto ${destino.numero} está cheio (${destino.pacientes.length}/${destino.capacidade})` }, { status: 400 });
    }

    const quartoAnterior = paciente.quartoId;

    // Transfer
    await prisma.paciente.update({
      where: { id: pacienteId },
      data: { quartoId: quartoDestinoId },
    });

    // Update old room status if empty now
    if (quartoAnterior) {
      const remaining = await prisma.paciente.count({
        where: { quartoId: quartoAnterior, status: "ATIVO", deletedAt: null, id: { not: pacienteId } },
      });
      if (remaining === 0) {
        await prisma.quarto.update({ where: { id: quartoAnterior }, data: { status: "DISPONIVEL" } });
      }
    }

    // Update destination room status
    await prisma.quarto.update({ where: { id: quartoDestinoId }, data: { status: "OCUPADO" } });

    await logAudit(session.userId, "TRANSFER", "Quarto", pacienteId, { de: quartoAnterior, para: quartoDestinoId });

    return NextResponse.json({ success: true, message: `${paciente.nome} transferido para ${destino.numero}` });
  } catch (error) {
    console.error("POST /api/quartos/transferir error:", error);
    return NextResponse.json({ success: false, error: "Erro ao transferir" }, { status: 500 });
  }
}
