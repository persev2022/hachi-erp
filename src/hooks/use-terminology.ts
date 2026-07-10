"use client";

import * as React from "react";

export interface Terminology {
  paciente: string;
  pacientes: string;
  evolucao: string;
  evolucoes: string;
  admissao: string;
  alta: string;
  quarto: string;
  quartos: string;
  diasTratamento: string;
  portalFamilia: string;
  acolhido: string;
  novoPaciente: string;
  novaEvolucao: string;
  novoAgendamento: string;
}

const DEFAULT_TERMINOLOGY: Terminology = {
  paciente: "Paciente",
  pacientes: "Pacientes",
  evolucao: "Evolução",
  evolucoes: "Evoluções",
  admissao: "Admissão",
  alta: "Alta",
  quarto: "Quarto",
  quartos: "Quartos",
  diasTratamento: "Dias de tratamento",
  portalFamilia: "Portal da Família",
  acolhido: "Paciente",
  novoPaciente: "Novo Paciente",
  novaEvolucao: "Nova Evolução",
  novoAgendamento: "Novo Agendamento",
};

// Cache to avoid re-fetching
let cachedTerminology: Terminology | null = null;
let fetchPromise: Promise<Terminology> | null = null;

async function fetchTerminology(): Promise<Terminology> {
  try {
    const res = await fetch("/api/platform/terminology");
    const data = await res.json();
    if (data.success && data.terminology) {
      const t = data.terminology;
      const term: Terminology = {
        paciente: t.paciente || "Paciente",
        pacientes: t.paciente ? `${t.paciente}s` : "Pacientes",
        evolucao: t.evolucao || "Evolução",
        evolucoes: t.evolucao ? `${t.evolucao}s` : "Evoluções",
        admissao: t.admissao || "Admissão",
        alta: t.alta || "Alta",
        quarto: t.quarto || "Quarto",
        quartos: t.quartos || "Quartos",
        diasTratamento: t.diasTratamento || "Dias de tratamento",
        portalFamilia: t.portalFamilia || "Portal da Família",
        acolhido: t.acolhido || "Paciente",
        novoPaciente: `Novo ${t.paciente || "Paciente"}`,
        novaEvolucao: `Nova ${t.evolucao || "Evolução"}`,
        novoAgendamento: "Novo Agendamento",
      };
      cachedTerminology = term;
      return term;
    }
  } catch {
    // fallback
  }
  return DEFAULT_TERMINOLOGY;
}

/**
 * Hook to get vertical-adapted terminology.
 * Caches after first fetch. All pages share the same terms.
 */
export function useTerminology(): Terminology {
  const [terms, setTerms] = React.useState<Terminology>(cachedTerminology || DEFAULT_TERMINOLOGY);

  React.useEffect(() => {
    if (cachedTerminology) {
      setTerms(cachedTerminology);
      return;
    }
    if (!fetchPromise) {
      fetchPromise = fetchTerminology();
    }
    fetchPromise.then((t) => setTerms(t));
  }, []);

  return terms;
}
