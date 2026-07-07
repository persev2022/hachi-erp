/**
 * Hachi Recovery — Vertical Module
 *
 * Specific functionality for Comunidades Terapêuticas:
 * - Prontuário multidisciplinar (6 tipos de evolução)
 * - Plano Terapêutico Individual (PTI)
 * - Portal da Família
 * - Controle de leitos/quartos
 * - Prescrições médicas
 * - SISNAD export
 * - e-SUS integration
 *
 * This module contains domain-specific logic that does NOT belong
 * in the shared Business Layer. If another vertical doesn't need it,
 * it should be here (not in /lib or /app directly).
 */

export const VERTICAL_ID = "recovery";
export const VERTICAL_NAME = "Hachi Recovery";
export const VERTICAL_DESCRIPTION = "Comunidades Terapêuticas e Centros de Acolhimento";

// Recovery-specific enums (mirrored from Prisma for reference)
export const EVOLUCAO_TIPOS = [
  "MEDICA",
  "PSICOLOGICA",
  "ENFERMAGEM",
  "TERAPEUTICA",
  "SOCIAL",
  "NUTRICIONAL",
] as const;

export const PACIENTE_STATUS = [
  "ATIVO",
  "ALTA",
  "EVADIDO",
  "TRANSFERIDO",
  "OBITO",
] as const;

// Recovery-specific compliance codes
export const COMPLIANCE = {
  RAAS_CODE: "03.01.08.019-0",
  CID_RANGE: "F10-F19",
  ANVISA_RDC: "29/2011",
  CFM_RESOLUCAO: "1.638/2002",
};

// Modules that are Recovery-specific (not shared)
export const RECOVERY_MODULES = [
  "prontuario",
  "evolucoes",
  "prescricoes",
  "pti",
  "portalFamilia",
  "sisnad",
  "esus",
] as const;
