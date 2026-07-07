export const VERTICAL_ID = "restaurant";
export const VERTICAL_NAME = "Hachi Restaurant";
export const VERTICAL_DESCRIPTION = "Restaurantes, Bares, Pizzarias e Dark Kitchens";

export const RESTAURANT_TERMINOLOGY = {
  paciente: "Cliente",
  evolucao: "Pedido",
  admissao: "Abertura de mesa",
  alta: "Fechamento",
  quarto: "Mesa",
  quartos: "Mesas",
  diasTratamento: "—",
  portalFamilia: "Cardápio Digital",
  acolhido: "Cliente",
};

export const ORDER_STATUS = ["PENDENTE", "PREPARO", "PRONTO", "ENTREGUE", "CANCELADO"] as const;

export const PAYMENT_METHODS = [
  { id: "dinheiro", label: "Dinheiro" },
  { id: "credito", label: "Cartão de Crédito" },
  { id: "debito", label: "Cartão de Débito" },
  { id: "pix", label: "Pix" },
  { id: "vale_refeicao", label: "Vale Refeição" },
];

export const TABLE_STATUS = ["LIVRE", "OCUPADA", "RESERVADA", "LIMPEZA"] as const;
