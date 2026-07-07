/**
 * Hachi Clinic — Anamnese (Clinical History)
 *
 * Structured anamnese template for clinical records.
 * Used by doctors/professionals to document patient history
 * during initial consultation or follow-ups.
 */

export interface AnamneseHabitos {
  tabagismo: boolean;
  etilismo: boolean;
  atividadeFisica: string;
  alimentacao: string;
}

export interface Anamnese {
  queixaPrincipal: string;
  historiaDoencaAtual: string;
  historiaPregressa: string;
  historicoFamiliar: string;
  medicamentosEmUso: string[];
  alergias: string[];
  habitos: AnamneseHabitos;
  exameFisico?: string;
  hipoteseDiagnostica?: string;
  conduta?: string;
}

/**
 * Default anamnese template with empty/default values.
 * Used as initial state for new anamnese forms.
 */
export const ANAMNESE_TEMPLATE: Anamnese = {
  queixaPrincipal: "",
  historiaDoencaAtual: "",
  historiaPregressa: "",
  historicoFamiliar: "",
  medicamentosEmUso: [],
  alergias: [],
  habitos: {
    tabagismo: false,
    etilismo: false,
    atividadeFisica: "",
    alimentacao: "",
  },
  exameFisico: undefined,
  hipoteseDiagnostica: undefined,
  conduta: undefined,
};

/**
 * Creates a blank anamnese record with all fields initialized to defaults.
 * Returns a fresh copy (not a reference to ANAMNESE_TEMPLATE).
 */
export function createBlankAnamnese(): Anamnese {
  return {
    queixaPrincipal: "",
    historiaDoencaAtual: "",
    historiaPregressa: "",
    historicoFamiliar: "",
    medicamentosEmUso: [],
    alergias: [],
    habitos: {
      tabagismo: false,
      etilismo: false,
      atividadeFisica: "",
      alimentacao: "",
    },
    exameFisico: undefined,
    hipoteseDiagnostica: undefined,
    conduta: undefined,
  };
}

/**
 * Validates that a given anamnese has the minimum required fields filled.
 * At minimum, queixaPrincipal and historiaDoencaAtual must be provided.
 */
export function validateAnamnese(anamnese: Anamnese): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!anamnese.queixaPrincipal || anamnese.queixaPrincipal.trim().length === 0) {
    errors.push("Queixa principal é obrigatória");
  }
  if (!anamnese.historiaDoencaAtual || anamnese.historiaDoencaAtual.trim().length === 0) {
    errors.push("História da doença atual é obrigatória");
  }

  return { valid: errors.length === 0, errors };
}
