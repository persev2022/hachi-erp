export const VERTICAL_ID = "services";
export const VERTICAL_NAME = "Hachi Services";
export const VERTICAL_DESCRIPTION = "Agências, Consultorias, Escritórios e Prestadores";

export const SERVICES_TERMINOLOGY = {
  paciente: "Cliente",
  evolucao: "Registro de atividade",
  admissao: "Início do contrato",
  alta: "Encerramento",
  quarto: "Projeto",
  quartos: "Projetos",
  diasTratamento: "Prazo do contrato",
  portalFamilia: "Portal do Cliente",
  acolhido: "Cliente",
};

export const PROJECT_STATUS = ["PROPOSTA", "APROVADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"] as const;

export const SERVICE_TYPES = [
  { id: "consultoria", label: "Consultoria" },
  { id: "desenvolvimento", label: "Desenvolvimento" },
  { id: "design", label: "Design" },
  { id: "marketing", label: "Marketing" },
  { id: "contabilidade", label: "Contabilidade" },
  { id: "juridico", label: "Jurídico" },
  { id: "ti", label: "Tecnologia da Informação" },
];
