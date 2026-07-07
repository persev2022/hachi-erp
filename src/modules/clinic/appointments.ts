/**
 * Hachi Clinic — Appointment Types & Convênios
 *
 * Clinic-specific appointment configuration for scheduling,
 * including Brazilian health insurance (convênio) integration.
 */

export interface AppointmentType {
  id: string;
  label: string;
  defaultDuration: number; // minutes
  color: string;
}

export interface Convenio {
  id: string;
  label: string;
  tiss: boolean; // Requires TISS (Troca de Informações em Saúde Suplementar) billing
}

/**
 * Base appointment interface (matches Agendamento model fields).
 */
export interface BaseAppointment {
  id: string;
  pacienteId: string;
  profissionalId: string;
  tipo: string;
  dataHora: Date;
  duracao: number;
  status: string;
  observacoes?: string;
  sala?: string;
}

/**
 * Clinic-specific appointment extending the base with convênio and billing fields.
 */
export interface ClinicAppointment extends BaseAppointment {
  convenioId: string;
  guiaTISS?: string; // Número da guia TISS para faturamento
  valorParticular?: number; // Valor para consulta particular
  observacoesClinicas?: string; // Observações clínicas adicionais
}

/**
 * Available appointment types for the Clinic vertical.
 */
export const CLINIC_APPOINTMENT_TYPES: AppointmentType[] = [
  { id: "consulta", label: "Consulta", defaultDuration: 30, color: "#2563eb" },
  { id: "retorno", label: "Retorno", defaultDuration: 20, color: "#0d9488" },
  { id: "procedimento", label: "Procedimento", defaultDuration: 60, color: "#7c3aed" },
  { id: "exame", label: "Exame", defaultDuration: 15, color: "#dc2626" },
  { id: "avaliacao", label: "Avaliação", defaultDuration: 45, color: "#f59e0b" },
  { id: "teleconsulta", label: "Teleconsulta", defaultDuration: 30, color: "#06b6d4" },
];

/**
 * Health insurance providers (Convênios) supported.
 */
export const CONVENIOS: Convenio[] = [
  { id: "particular", label: "Particular", tiss: false },
  { id: "unimed", label: "Unimed", tiss: true },
  { id: "sulamerica", label: "SulAmérica", tiss: true },
  { id: "amil", label: "Amil", tiss: true },
  { id: "bradesco_saude", label: "Bradesco Saúde", tiss: true },
  { id: "hapvida", label: "Hapvida", tiss: true },
  { id: "notredame", label: "NotreDame Intermédica", tiss: true },
  { id: "sus", label: "SUS", tiss: false },
];

/**
 * Get appointment type by id.
 */
export function getAppointmentType(id: string): AppointmentType | undefined {
  return CLINIC_APPOINTMENT_TYPES.find((t) => t.id === id);
}

/**
 * Get convênio by id.
 */
export function getConvenio(id: string): Convenio | undefined {
  return CONVENIOS.find((c) => c.id === id);
}
