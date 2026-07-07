/**
 * Hachi Hotel — Vertical Module (Planned)
 *
 * For: Pousadas, Hotéis, Hostels, Resorts
 *
 * Specific modules needed:
 * - Reservas (booking engine)
 * - Check-in / Check-out
 * - Gestão de quartos/unidades habitacionais
 * - Tarifas e temporadas
 * - Portal do hóspede
 * - Channel manager (futuro: Booking, Airbnb)
 * - Housekeeping
 *
 * Reuses from Core:
 * - Financeiro, Documentos, Comunicação, Estoque, Relatórios, Auth
 *
 * Adaptations from Recovery:
 * - Quartos → UH (Unidade Habitacional)
 * - Paciente → Hóspede
 * - Portal da Família → Portal do Hóspede
 * - Admissão → Check-in
 * - Alta → Check-out
 */

export const VERTICAL_ID = "hotel";
export const VERTICAL_NAME = "Hachi Hotel";
export const VERTICAL_DESCRIPTION = "Hotéis, Pousadas e Resorts";

export const HOTEL_MODULES = [
  "reservas",
  "checkinCheckout",
  "unidadesHabitacionais",
  "tarifas",
  "portalHospede",
  "housekeeping",
  "channelManager",
] as const;

export const ADAPTATIONS = {
  "Paciente": "Hóspede",
  "Quarto": "UH (Unidade Habitacional)",
  "Portal da Família": "Portal do Hóspede",
  "Admissão": "Check-in",
  "Alta": "Check-out",
  "Evolução": "Histórico de Hospedagem",
};
