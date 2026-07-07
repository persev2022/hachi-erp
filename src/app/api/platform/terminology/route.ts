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
  },
  hotel: {
    paciente: "Hóspede",
    evolucao: "Registro",
    admissao: "Check-in",
    alta: "Check-out",
    quarto: "UH",
    quartos: "UHs",
    diasTratamento: "Diárias previstas",
    portalFamilia: "Portal do Hóspede",
    acolhido: "Hóspede",
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
