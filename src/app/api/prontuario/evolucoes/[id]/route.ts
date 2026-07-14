import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// GET: Get a single evolution
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const evolucao = await prisma.evolucao.findUnique({
      where: { id },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true, tenantId: true } },
        profissional: { select: { id: true, name: true, role: true, crm: true, crp: true, coren: true } },
      },
    });

    if (!evolucao) {
      return NextResponse.json({ success: false, error: "Evolução não encontrada" }, { status: 404 });
    }

    // Tenant isolation check
    if (evolucao.paciente?.tenantId && evolucao.paciente.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Evolução não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evolucao });
  } catch (error) {
    console.error("GET /api/prontuario/evolucoes/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar evolução" }, { status: 500 });
  }
}

// PUT: Sign evolution (irreversible)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const evolucao = await prisma.evolucao.findUnique({ where: { id }, include: { paciente: { select: { tenantId: true } } } });

    if (!evolucao) {
      return NextResponse.json({ success: false, error: "Evolução não encontrada" }, { status: 404 });
    }

    // Tenant isolation
    if (evolucao.paciente?.tenantId && evolucao.paciente.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Evolução não encontrada" }, { status: 404 });
    }

    // Only the author can sign
    if (evolucao.profissionalId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Apenas o autor pode assinar a evolução" },
        { status: 403 }
      );
    }

    if (evolucao.assinado) {
      return NextResponse.json(
        { success: false, error: "Evolução já assinada. Não é possível modificar." },
        { status: 409 }
      );
    }

    if (body.action === "assinar") {
      const updated = await prisma.evolucao.update({
        where: { id },
        data: { assinado: true, assinadoEm: new Date() },
        include: {
          paciente: { select: { id: true, nome: true } },
          profissional: { select: { id: true, name: true, role: true } },
        },
      });

      await logAudit(session.userId, "SIGN", "Evolucao", id, {
        pacienteId: evolucao.pacienteId,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/prontuario/evolucoes/[id] error:", error);
    return NextResponse.json({ success: false, error: "Erro ao atualizar evolução" }, { status: 500 });
  }
}
