/**
 * Hachi Core — Shared Business Layer
 *
 * Modules available to ALL verticals:
 * - Financeiro (contas, fluxo, DRE, cobrança)
 * - Agenda (scheduling, salas, profissionais)
 * - Documentos (templates, geração, assinatura)
 * - Estoque (categorias, alertas, movimentação)
 * - Comunicação (WhatsApp, email, SMS)
 * - Relatórios (dashboards, BI, exportação)
 * - Auth (login, RBAC, 2FA, audit)
 * - Configurações (sistema, integrações)
 *
 * These modules are vertical-agnostic. They work the same
 * whether the tenant is a CT, a clinic, or a hotel.
 */

export const CORE_MODULES = [
  "auth",
  "financeiro",
  "agenda",
  "documentos",
  "estoque",
  "comunicacao",
  "relatorios",
  "configuracoes",
  "users",
  "audit",
] as const;

// Core module descriptions
export const MODULE_DESCRIPTIONS: Record<string, string> = {
  auth: "Autenticação, RBAC, sessões e 2FA",
  financeiro: "Contas a pagar/receber, fluxo de caixa, DRE",
  agenda: "Agendamentos, salas, profissionais, disponibilidade",
  documentos: "Geração de contratos, receitas, recibos via templates",
  estoque: "Controle de itens, alertas de mínimo, validade",
  comunicacao: "WhatsApp (BotConversa), email, histórico",
  relatorios: "Dashboards, KPIs, exportação Excel/PDF",
  configuracoes: "Parâmetros do sistema, integrações, branding",
  users: "Gestão de usuários e perfis de acesso",
  audit: "Trilha de auditoria completa",
};
