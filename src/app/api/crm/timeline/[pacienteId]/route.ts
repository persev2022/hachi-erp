import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/api-helpers";

const ALLOWED_ROLES = ["ADMIN", "COORDENADOR", "SECRETARIA"];

interface TimelineEvent {
  id: string;
  type: "evolucao" | "comunicacao" | "agendamento" | "documento";
  title: string;
  description: string;
  date: Date;
  metadata?: Record<string, unknown>;
}

/**
 * GET /api/crm/timeline/:pacienteId
 * Returns a unified timeline of all interactions for a patient.
 * Combines evoluções, comunicações, agendamentos, and documentos.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pacienteId: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return apiUnauthorized();
    if (!ALLOWED_ROLES.includes(session.role)) return apiForbidden();

    const { pacienteId } = await params;

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: { id: true, nome: true, status: true, tenantId: true },
    });

    if (!paciente) return apiNotFound("Paciente não encontrado");

    // Tenant isolation
    if (session.tenantId && paciente.tenantId !== session.tenantId) {
      return apiForbidden("Acesso negado a este paciente");
    }

    // Fetch all interaction types in parallel
    const [evolucoes, comunicacoes, agendamentos, documentos] = await Promise.all([
      prisma.evolucao.findMany({
        where: { pacienteId },
        select: {
          id: true,
          tipo: true,
          conteudo: true,
          createdAt: true,
          profissional: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.comunicacao.findMany({
        where: { pacienteId },
        select: {
          id: true,
          canal: true,
          assunto: true,
          mensagem: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.agendamento.findMany({
        where: { pacienteId },
        select: {
          id: true,
          tipo: true,
          dataHora: true,
          status: true,
          profissional: { select: { name: true } },
        },
        orderBy: { dataHora: "desc" },
        take: 50,
      }),
      prisma.documento.findMany({
        where: { pacienteId },
        select: {
          id: true,
          tipo: true,
          titulo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    // Unify into timeline events
    const timeline: TimelineEvent[] = [];

    for (const e of evolucoes) {
      timeline.push({
        id: e.id,
        type: "evolucao",
        title: `Evolução ${e.tipo.toLowerCase()}`,
        description: e.conteudo.substring(0, 150) + (e.conteudo.length > 150 ? "..." : ""),
        date: e.createdAt,
        metadata: { profissional: e.profissional.name, tipoEvolucao: e.tipo },
      });
    }

    for (const c of comunicacoes) {
      timeline.push({
        id: c.id,
        type: "comunicacao",
        title: c.assunto || `Mensagem via ${c.canal}`,
        description: c.mensagem.substring(0, 150) + (c.mensagem.length > 150 ? "..." : ""),
        date: c.createdAt,
        metadata: { canal: c.canal, status: c.status },
      });
    }

    for (const a of agendamentos) {
      timeline.push({
        id: a.id,
        type: "agendamento",
        title: `${a.tipo} — ${a.status}`,
        description: `Com ${a.profissional.name}`,
        date: a.dataHora,
        metadata: { status: a.status, profissional: a.profissional.name },
      });
    }

    for (const d of documentos) {
      timeline.push({
        id: d.id,
        type: "documento",
        title: d.titulo,
        description: `Documento: ${d.tipo}`,
        date: d.createdAt,
        metadata: { tipoDocumento: d.tipo },
      });
    }

    // Sort all events by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return apiSuccess({
      paciente: { id: paciente.id, nome: paciente.nome, status: paciente.status },
      timeline: timeline.slice(0, 100), // cap at 100 events
      counts: {
        evolucoes: evolucoes.length,
        comunicacoes: comunicacoes.length,
        agendamentos: agendamentos.length,
        documentos: documentos.length,
      },
    });
  } catch (error) {
    console.error("GET /api/crm/timeline error:", error);
    return apiError("Erro ao buscar timeline do paciente", 500);
  }
}
