/**
 * Hachi Clinic — Vertical Module
 *
 * For: Clínicas médicas, odontológicas, psicologia, fisioterapia
 *
 * Specific modules needed:
 * - Prontuário clínico (adaptado do Recovery)
 * - Agenda de profissionais com convênios
 * - Faturamento TISS (guias, autorizações)
 * - Exames e resultados
 * - CRM de pacientes
 * - Anamnese
 *
 * Reuses from Core:
 * - Financeiro, Documentos, Comunicação, Estoque, Relatórios, Auth
 *
 * NOT needed (from Recovery):
 * - Portal da Família (substituído por Portal do Paciente)
 * - SISNAD, e-SUS
 * - Quartos/Leitos (pode ter salas)
 * - Status EVADIDO
 */

// Re-export clinic-specific modules
export { CLINIC_APPOINTMENT_TYPES, CONVENIOS, getAppointmentType, getConvenio } from "./appointments";
export type { AppointmentType, Convenio, ClinicAppointment, BaseAppointment } from "./appointments";

export { ANAMNESE_TEMPLATE, createBlankAnamnese, validateAnamnese } from "./anamnese";
export type { Anamnese, AnamneseHabitos } from "./anamnese";

export const VERTICAL_ID = "clinic";
export const VERTICAL_NAME = "Hachi Clinic";
export const VERTICAL_DESCRIPTION = "Clínicas Médicas e Consultórios";

export const CLINIC_MODULES = [
  "prontuarioClinico",
  "agendaProfissionais",
  "convenios",
  "faturamentoTISS",
  "exames",
  "crm",
  "anamnese",
  "portalPaciente",
] as const;

/**
 * Terminology mapping: generic terms → clinic-specific terms.
 * Used to adapt the UI language for the Clinic vertical.
 */
export const CLINIC_TERMINOLOGY = {
  paciente: "Paciente",
  evolucao: "Atendimento",
  admissao: "Cadastro",
  alta: "Encerramento",
  quarto: "Sala",
  quartos: "Salas",
  diasTratamento: "Sessões previstas",
  portalFamilia: "Portal do Paciente",
  acolhido: "Paciente",
};

// What to rename/adapt from Recovery (legacy, kept for backwards compat)
export const ADAPTATIONS = {
  "Paciente": "Paciente",
  "Quarto": "Sala",
  "Portal da Família": "Portal do Paciente",
  "Evolução": "Atendimento",
  "Acolhido": "Paciente",
};
