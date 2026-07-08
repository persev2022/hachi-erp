/**
 * Tipos globais do Hachi Platform.
 * Quando o Prisma estiver conectado, reimportar de @prisma/client.
 */

// Enums (espelhados do schema.prisma para uso sem banco)
export type Role = "ADMIN" | "MEDICO" | "PSICOLOGO" | "ENFERMEIRO" | "TERAPEUTA" | "SECRETARIA" | "FINANCEIRO" | "MONITOR" | "APOIO";
export type StatusPaciente = "ATIVO" | "ALTA" | "EVADIDO" | "TRANSFERIDO" | "OBITO";
export type EstadoCivil = "SOLTEIRO" | "CASADO" | "DIVORCIADO" | "VIUVO" | "UNIAO_ESTAVEL";

// ─── API Response Padrão ────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ─── Session / Auth ─────────────────────────────────────────────
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ─── Query Params ───────────────────────────────────────────────
export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
