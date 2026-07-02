import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const sinaisVitaisSchema = z.object({
  pacienteId: z.string().uuid(),
  pa: z.string().optional(), // Pressão arterial "120x80"
  fc: z.number().int().min(20).max(300).optional(), // Freq. cardíaca
  fr: z.number().int().min(5).max(80).optional(), // Freq. respiratória
  temp: z.number().min(30).max(45).optional(), // Temperatura
  spo2: z.number().int().min(50).max(100).optional(), // Saturação O2
  peso: z.number().min(1).max(500).optional(), // Peso kg
  glicemia: z.number().int().min(20).max(600).optional(),
  observacoes: z.string().optional(),
});

// GET: List vital signs for a patient (time series)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");
    const dias = parseInt(searchParams.get("dias") || "30");

    if (!pacienteId) {
      return NextResponse.json({ success: false, error: "pacienteId obrigatório" }, { status: 400 });
    }

    const since = new Date(Date.now() - dias * 86400000);

    // Get vital signs from evolucoes that have sinaisVitais
    const evolucoes = await prisma.evolucao.findMany({
      where: {
        pacienteId,
        sinaisVitais: { not: null },
        createdAt: { gte: since },
      },
      select: {
        id: true,
        sinaisVitais: true,
        createdAt: true,
        profissional: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Format as time series
    const series = evolucoes.map((e) => ({
      id: e.id,
      data: e.createdAt,
      profissional: e.profissional.name,
      ...(e.sinaisVitais as Record<string, any>),
    }));

    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    console.error("GET /api/prontuario/sinais-vitais error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}

// POST: Register vital signs (creates an evolution of type ENFERMAGEM)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "MEDICO", "ENFERMEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = sinaisVitaisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pacienteId, observacoes, ...vitais } = parsed.data;

    // Create as an ENFERMAGEM evolution with vital signs
    const evolucao = await prisma.evolucao.create({
      data: {
        pacienteId,
        profissionalId: session.userId,
        tipo: "ENFERMAGEM",
        conteudo: observacoes || `Sinais vitais: PA ${vitais.pa || '-'}, FC ${vitais.fc || '-'}, T ${vitais.temp || '-'}°C`,
        sinaisVitais: vitais,
        assinado: true,
        assinadoEm: new Date(),
      },
      include: {
        paciente: { select: { nome: true } },
        profissional: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: evolucao }, { status: 201 });
  } catch (error) {
    console.error("POST /api/prontuario/sinais-vitais error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
