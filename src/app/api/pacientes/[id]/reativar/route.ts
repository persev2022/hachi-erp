import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const reativarSchema = z.object({
  diasTratamento: z.number().int().min(1, "Dias de tratamento é obrigatório"),
  quartoId: z.string().uuid().optional(),
  observacoes: z.string().optional(),
});

/**
 * POST: Reactivate a patient — starts a new treatment from today.
 * Resets: status=ATIVO, dataAdmissao=now, dataAlta=null, new diasTratamento
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    if (!["ADMIN", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Apenas Admin ou Coordenador pode reativar" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = reativarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { diasTratamento, quartoId, observacoes } = parsed.data;

    // Find patient
    const paciente = await prisma.paciente.findFirst({
      where: { id, deletedAt: null, ...(session.tenantId ? { tenantId: session.tenantId } : {}) },
    });

    if (!paciente) return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });

    if (paciente.status === "ATIVO") {
      return NextResponse.json({ success: false, error: "Paciente já está ativo" }, { status: 400 });
    }

    // If quarto specified, check capacity
    if (quartoId) {
      const quarto = await prisma.quarto.findFirst({
        where: { id: quartoId, ...(session.tenantId ? { tenantId: session.tenantId } : {}) },
        include: { pacientes: { where: { status: "ATIVO", deletedAt: null } } },
      });
      if (!quarto) return NextResponse.json({ success: false, error: "Quarto não encontrado" }, { status: 404 });
      if (quarto.pacientes.length >= quarto.capacidade) {
        return NextResponse.json({ success: false, error: `Quarto ${quarto.numero} está cheio` }, { status: 400 });
      }
    }

    // Reactivate patient
    const now = new Date();
    await prisma.paciente.update({
      where: { id },
      data: {
        status: "ATIVO",
        dataAdmissao: now,
        dataAlta: null,
        diasTratamento,
        quartoId: quartoId || null,
        internacoesPrevias: (paciente.internacoesPrevias || 0) + 1,
      },
    });

    // Update quarto status
    if (quartoId) {
      await prisma.quarto.update({ where: { id: quartoId }, data: { status: "OCUPADO" } });
    }

    await logAudit(session.userId, "REACTIVATE", "Paciente", id, {
      diasTratamento,
      quartoId,
      observacoes,
      statusAnterior: paciente.status,
    });

    return NextResponse.json({
      success: true,
      message: `${paciente.nome} reativado com novo tratamento de ${diasTratamento} dias.`,
    });
  } catch (error) {
    console.error("POST /api/pacientes/[id]/reativar error:", error);
    return NextResponse.json({ success: false, error: "Erro ao reativar" }, { status: 500 });
  }
}
