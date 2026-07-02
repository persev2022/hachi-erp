import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const createPtiSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  objetivos: z.string().min(1, "Objetivos são obrigatórios"),
  metas: z.string().min(1, "Metas são obrigatórias"),
  intervencoes: z.string().min(1, "Intervenções são obrigatórias"),
  prazo: z.string().transform((s) => new Date(s)),
  observacoes: z.string().optional(),
});

// GET: List PTIs for a patient
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");

    if (!pacienteId) {
      return NextResponse.json(
        { success: false, error: "pacienteId é obrigatório" },
        { status: 400 }
      );
    }

    // PTIs are stored as Documento with tipo PTI
    // The structured data is stored as JSON in the arquivo field
    const ptis = await prisma.documento.findMany({
      where: {
        pacienteId,
        tipo: "PTI",
      },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse the JSON data stored in arquivo field
    const data = ptis.map((pti) => {
      let dadosPti = {};
      try {
        dadosPti = JSON.parse(pti.arquivo);
      } catch {
        dadosPti = {};
      }
      return {
        id: pti.id,
        pacienteId: pti.pacienteId,
        profissionalId: pti.geradoPor,
        titulo: pti.titulo,
        ...dadosPti,
        createdAt: pti.createdAt,
        paciente: pti.paciente,
      };
    });

    // Fetch profissional info for each PTI
    const profissionalIds = [...new Set(ptis.map((p) => p.geradoPor))];
    const profissionais = await prisma.user.findMany({
      where: { id: { in: profissionalIds } },
      select: { id: true, name: true, role: true },
    });
    const profissionalMap = Object.fromEntries(profissionais.map((p) => [p.id, p]));

    const dataWithProfissional = data.map((item) => ({
      ...item,
      profissional: profissionalMap[item.profissionalId] || null,
    }));

    await logAudit(session.userId, "READ", "PTI", undefined, { pacienteId });

    return NextResponse.json({ success: true, data: dataWithProfissional });
  } catch (error) {
    console.error("GET /api/prontuario/pti error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar PTIs" },
      { status: 500 }
    );
  }
}

// POST: Create PTI
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createPtiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: parsed.data.pacienteId, deletedAt: null },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Store PTI data as JSON in the arquivo field
    const ptiData = JSON.stringify({
      objetivos: parsed.data.objetivos,
      metas: parsed.data.metas,
      intervencoes: parsed.data.intervencoes,
      prazo: parsed.data.prazo.toISOString(),
      observacoes: parsed.data.observacoes || "",
    });

    const documento = await prisma.documento.create({
      data: {
        pacienteId: parsed.data.pacienteId,
        tipo: "PTI",
        titulo: `PTI - ${paciente.nome} - ${new Date().toLocaleDateString("pt-BR")}`,
        arquivo: ptiData,
        formato: "json",
        geradoPor: session.userId,
      },
      include: {
        paciente: { select: { id: true, nome: true, cpf: true } },
      },
    });

    // Get profissional info
    const profissional = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, role: true },
    });

    await logAudit(session.userId, "CREATE", "PTI", documento.id, {
      pacienteId: parsed.data.pacienteId,
      objetivos: parsed.data.objetivos,
      metas: parsed.data.metas,
    });

    // Return parsed response
    const response = {
      id: documento.id,
      pacienteId: documento.pacienteId,
      profissionalId: documento.geradoPor,
      titulo: documento.titulo,
      objetivos: parsed.data.objetivos,
      metas: parsed.data.metas,
      intervencoes: parsed.data.intervencoes,
      prazo: parsed.data.prazo.toISOString(),
      observacoes: parsed.data.observacoes || "",
      createdAt: documento.createdAt,
      paciente: documento.paciente,
      profissional,
    };

    return NextResponse.json({ success: true, data: response }, { status: 201 });
  } catch (error) {
    console.error("POST /api/prontuario/pti error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar PTI" },
      { status: 500 }
    );
  }
}
