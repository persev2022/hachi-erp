import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// Roles that can create/view assessments
const ALLOWED_ROLES = ["ADMIN", "COORDENADOR", "PSICOLOGO", "TERAPEUTA"];

const avaliacaoSchema = z.object({
  pacienteId: z.string().uuid(),
  tipo: z.enum(["INDIVIDUAL", "SEMANAL"]),
  semanaInicio: z.string(),
  semanaFim: z.string(),
  dados: z.object({
    // Individual assessment fields
    conscienciaEmocional: z.enum(["BAIXA", "MEDIA", "BOA"]).optional(),
    conscienciaObs: z.string().optional(),
    conscienciaSatisfacao: z.enum(["FELIZ", "ESTAVEL", "EM_CRISE"]).optional(),
    reatividade: z.enum(["VERMELHO", "AMARELO", "VERDE"]).optional(),
    reatividadeObs: z.string().optional(),
    reatividadeSatisfacao: z.enum(["ESTAVEL", "ATENCAO", "EM_CRISE"]).optional(),
    participacao: z.enum(["PASSIVA", "REGULAR", "ATIVA"]).optional(),
    participacaoObs: z.string().optional(),
    participacaoSatisfacao: z.enum(["SATISFEITA", "EM_OBSERVACAO", "REFORCO"]).optional(),
    cumprimentoRotina: z.enum(["FRACO", "REGULAR", "BOM"]).optional(),
    cumprimentoObs: z.string().optional(),
    cumprimentoSatisfacao: z.enum(["SATISFEITA", "EM_OBSERVACAO", "REFORCO"]).optional(),
    vinculoCentro: z.enum(["INSTAVEL", "EM_CONSTRUCAO", "ESTAVEL"]).optional(),
    vinculoSatisfacao: z.enum(["SATISFEITA", "EM_OBSERVACAO", "REFORCO"]).optional(),
    riscosAbstinencia: z.array(z.string()).optional(),
    nivelRisco: z.enum(["ESTAVEL", "ATENCAO", "EM_CRISE"]).optional(),
    intervencoes: z.array(z.string()).optional(),
    intervencaoDescricao: z.string().optional(),
    intervencaoSatisfacao: z.enum(["SATISFEITA", "EM_OBSERVACAO", "REFORCO"]).optional(),
    focoProximaSemana: z.array(z.string()).optional(),
    focoSatisfacao: z.enum(["SATISFEITA", "EM_OBSERVACAO", "RETORNO"]).optional(),
    // Weekly report fields
    acolhidosAtivos: z.number().optional(),
    entradasSemana: z.number().optional(),
    saidasSemana: z.number().optional(),
    evasoes: z.number().optional(),
    recaidas: z.number().optional(),
    resumoExecutivo: z.string().optional(),
    participacaoAtividades: z.enum(["BAIXA", "MEDIA", "ALTA"]).optional(),
    reunioesRealizadas: z.number().optional(),
    ciclo: z.enum(["SEMANAL", "MENSAL_CONTINUO"]).optional(),
    mapaRisco: z.object({
      baixo: z.number().optional(),
      medio: z.number().optional(),
      alto: z.number().optional(),
    }).optional(),
    sinaisObservados: z.array(z.string()).optional(),
    conversasIndividuais: z.number().optional(),
    intervencoesPreventivas: z.number().optional(),
    intervencoesImediatas: z.number().optional(),
    sinteseAcoes: z.string().optional(),
    resultadosSemana: z.array(z.string()).optional(),
    pontosAtencao: z.string().optional(),
    focoTerapeutico: z.string().optional(),
    ajustesOperacionais: z.string().optional(),
    apoioDiretoria: z.string().optional(),
    consideracoesFinais: z.string().optional(),
  }),
});

// POST: Create new assessment
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ success: false, error: "Sem permissão. Apenas Admin, Coordenador, Psicólogo e Terapeuta podem registrar avaliações." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = avaliacaoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { pacienteId, tipo, semanaInicio, semanaFim, dados } = parsed.data;

    // Verify patient exists and belongs to tenant
    const paciente = await prisma.paciente.findFirst({
      where: { id: pacienteId, deletedAt: null, ...(session.tenantId ? { tenantId: session.tenantId } : {}) },
    });

    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    // Calculate score (for individual assessments)
    let score: number | null = null;
    if (tipo === "INDIVIDUAL") {
      score = calculateScore(dados);
    }

    // Save as SystemConfig (no schema migration needed)
    const key = `avaliacao_${session.tenantId}_${pacienteId}_${tipo}_${Date.now()}`;
    await prisma.systemConfig.create({
      data: {
        key,
        value: JSON.stringify({
          pacienteId,
          pacienteNome: paciente.nome,
          tipo,
          semanaInicio,
          semanaFim,
          dados,
          score,
          criadoPor: session.userId,
          criadoPorNome: session.role,
          criadoEm: new Date().toISOString(),
          tenantId: session.tenantId,
        }),
      },
    });

    await logAudit(session.userId, "CREATE", "Avaliacao", key, { tipo, pacienteId, score });

    return NextResponse.json({ success: true, data: { key, score } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/avaliacoes error:", error);
    return NextResponse.json({ success: false, error: "Erro ao salvar avaliação" }, { status: 500 });
  }
}

// GET: List assessments for a patient
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ success: false, error: "Sem permissão" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");
    const tipo = searchParams.get("tipo");

    const prefix = `avaliacao_${session.tenantId}_${pacienteId || ""}`;

    const configs = await prisma.systemConfig.findMany({
      where: { key: { startsWith: prefix } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const avaliacoes = configs
      .map((c) => { try { return { key: c.key, ...JSON.parse(c.value) }; } catch { return null; } })
      .filter(Boolean)
      .filter((a: any) => !tipo || a.tipo === tipo);

    return NextResponse.json({ success: true, data: avaliacoes });
  } catch (error) {
    console.error("GET /api/avaliacoes error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar avaliações" }, { status: 500 });
  }
}

// Calculate score from individual assessment (0-100)
function calculateScore(dados: any): number {
  let total = 0;
  let max = 0;

  // Consciência Emocional (0-2)
  if (dados.conscienciaEmocional) {
    max += 2;
    total += dados.conscienciaEmocional === "BOA" ? 2 : dados.conscienciaEmocional === "MEDIA" ? 1 : 0;
  }
  // Reatividade (0-2)
  if (dados.reatividade) {
    max += 2;
    total += dados.reatividade === "VERDE" ? 2 : dados.reatividade === "AMARELO" ? 1 : 0;
  }
  // Participação (0-2)
  if (dados.participacao) {
    max += 2;
    total += dados.participacao === "ATIVA" ? 2 : dados.participacao === "REGULAR" ? 1 : 0;
  }
  // Cumprimento rotina (0-2)
  if (dados.cumprimentoRotina) {
    max += 2;
    total += dados.cumprimentoRotina === "BOM" ? 2 : dados.cumprimentoRotina === "REGULAR" ? 1 : 0;
  }
  // Vínculo (0-2)
  if (dados.vinculoCentro) {
    max += 2;
    total += dados.vinculoCentro === "ESTAVEL" ? 2 : dados.vinculoCentro === "EM_CONSTRUCAO" ? 1 : 0;
  }
  // Nível risco (0-2)
  if (dados.nivelRisco) {
    max += 2;
    total += dados.nivelRisco === "ESTAVEL" ? 2 : dados.nivelRisco === "ATENCAO" ? 1 : 0;
  }

  return max > 0 ? Math.round((total / max) * 100) : 0;
}
