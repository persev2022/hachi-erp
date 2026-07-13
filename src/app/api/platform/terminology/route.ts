import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * Terminology per vertical — maps generic terms to vertical-specific labels.
 */
const TERMINOLOGY: Record<string, Record<string, string>> = {
  recovery: {
    paciente: "Acolhido",
    evolucao: "Evolução",
    admissao: "Admissão",
    alta: "Alta",
    quarto: "Leito",
    quartos: "Leitos",
    diasTratamento: "Dias de tratamento",
    portalFamilia: "Portal da Família",
    acolhido: "Acolhido",
    responsavel: "Responsável",
    agendamentoHoje: "Consultas Hoje",
  },
  clinic: {
    paciente: "Paciente",
    evolucao: "Atendimento",
    admissao: "Cadastro",
    alta: "Encerramento",
    quarto: "Sala",
    quartos: "Salas",
    diasTratamento: "Sessões previstas",
    portalFamilia: "Portal do Paciente",
    acolhido: "Paciente",
    responsavel: "Responsável",
    agendamentoHoje: "Consultas Hoje",
  },
  senior: {
    paciente: "Residente",
    evolucao: "Acompanhamento",
    admissao: "Acolhimento",
    alta: "Desligamento",
    quarto: "Suíte",
    quartos: "Suítes",
    diasTratamento: "Período de estadia",
    portalFamilia: "Portal do Familiar",
    acolhido: "Residente",
    responsavel: "Familiar responsável",
    agendamentoHoje: "Atividades Hoje",
  },
  hotel: {
    paciente: "Hóspede",
    evolucao: "Registro",
    admissao: "Check-in",
    alta: "Check-out",
    quarto: "UH",
    quartos: "Unidades Habitacionais",
    diasTratamento: "Diárias",
    portalFamilia: "Portal do Hóspede",
    acolhido: "Hóspede",
    responsavel: "Contato",
    agendamentoHoje: "Check-ins Hoje",
  },
  restaurant: {
    paciente: "Cliente",
    evolucao: "Pedido",
    admissao: "Abertura de mesa",
    alta: "Fechamento",
    quarto: "Mesa",
    quartos: "Mesas",
    diasTratamento: "—",
    portalFamilia: "Cardápio Digital",
    acolhido: "Cliente",
    responsavel: "Contato",
    agendamentoHoje: "Reservas Hoje",
  },
  education: {
    paciente: "Aluno",
    evolucao: "Registro Acadêmico",
    admissao: "Matrícula",
    alta: "Formatura",
    quarto: "Sala de Aula",
    quartos: "Salas",
    diasTratamento: "Período letivo",
    portalFamilia: "Portal dos Pais",
    acolhido: "Aluno",
    responsavel: "Responsável legal",
    agendamentoHoje: "Aulas Hoje",
  },
  vet: {
    paciente: "Animal",
    evolucao: "Atendimento",
    admissao: "Cadastro",
    alta: "Alta veterinária",
    quarto: "Baia",
    quartos: "Baias",
    diasTratamento: "Internação prevista",
    portalFamilia: "Portal do Tutor",
    acolhido: "Pet",
    responsavel: "Tutor",
    agendamentoHoje: "Consultas Hoje",
  },
  services: {
    paciente: "Cliente",
    evolucao: "Registro de atividade",
    admissao: "Início do contrato",
    alta: "Encerramento",
    quarto: "Projeto",
    quartos: "Projetos",
    diasTratamento: "Prazo do contrato",
    portalFamilia: "Portal do Cliente",
    acolhido: "Cliente",
    responsavel: "Contato principal",
    agendamentoHoje: "Reuniões Hoje",
  },
  generic: {
    paciente: "Cliente",
    evolucao: "Registro",
    admissao: "Entrada",
    alta: "Saída",
    quarto: "Unidade",
    quartos: "Unidades",
    diasTratamento: "Período previsto",
    portalFamilia: "Portal do Cliente",
    acolhido: "Cliente",
    responsavel: "Responsável",
    agendamentoHoje: "Agendamentos Hoje",
  },
};

/**
 * GET /api/platform/terminology
 * Returns terminology based on the authenticated user's tenant vertical.
 * Falls back to generic if no tenant or unknown vertical.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    let vertical = "generic";

    if (session?.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.tenantId },
        select: { vertical: true },
      });
      if (tenant?.vertical && tenant.vertical in TERMINOLOGY) {
        vertical = tenant.vertical;
      }
    }

    return NextResponse.json({
      success: true,
      vertical,
      terminology: TERMINOLOGY[vertical],
    });
  } catch (error) {
    console.error("GET /api/platform/terminology error:", error);
    return NextResponse.json(
      { success: true, vertical: "generic", terminology: TERMINOLOGY.generic },
      { status: 200 }
    );
  }
}
