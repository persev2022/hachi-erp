/**
 * Hachi Restaurant — Vertical Module (Planned)
 *
 * For: Restaurantes, Pizzarias, Hamburguerias, Dark Kitchens, Cafeterias
 *
 * Specific modules needed:
 * - PDV (Ponto de Venda)
 * - Comandas
 * - KDS (Kitchen Display System)
 * - Produção / Ficha Técnica
 * - Delivery
 * - Cardápio digital
 * - Integrações (iFood, Rappi, UberEats)
 * - Mesas e salão
 *
 * Reuses from Core:
 * - Financeiro, Estoque, Documentos, Comunicação, Relatórios, Auth, NFS-e
 *
 * NOT needed:
 * - Prontuário, Quartos, Portal da Família, Agenda clínica
 * - Prescrições, Evoluções, SISNAD
 */

export const VERTICAL_ID = "restaurant";
export const VERTICAL_NAME = "Hachi Restaurant";
export const VERTICAL_DESCRIPTION = "Restaurantes, Bares e Delivery";

export const RESTAURANT_MODULES = [
  "pdv",
  "comandas",
  "kds",
  "producao",
  "delivery",
  "cardapio",
  "mesas",
  "integracoesDelivery",
] as const;

export const ADAPTATIONS = {
  "Paciente": "Cliente",
  "Quarto": "Mesa",
  "Estoque": "Insumos",
  "Portal da Família": "Cardápio Digital",
};
