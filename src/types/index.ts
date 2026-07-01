/**
 * Tipos globais do Hachi ERP.
 * Tipos específicos de módulo ficam em seus respectivos arquivos.
 */

export type { Role, StatusPaciente, EstadoCivil } from "@prisma/client";
export type { User, Paciente, Responsavel, Evolucao, Prescricao, Agendamento, Quarto, MovimentacaoFinanceira, Documento, Comunicacao, ItemEstoque, AuditLog } from "@prisma/client";

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
