export const VERTICAL_ID = "vet";
export const VERTICAL_NAME = "Hachi Vet";
export const VERTICAL_DESCRIPTION = "Clínicas Veterinárias, Pet Shops e Hotel Pet";

export const VET_TERMINOLOGY = {
  paciente: "Animal",
  evolucao: "Atendimento",
  admissao: "Cadastro",
  alta: "Alta veterinária",
  quarto: "Baia",
  quartos: "Baias",
  diasTratamento: "Internação prevista",
  portalFamilia: "Portal do Tutor",
  acolhido: "Pet",
};

export const ANIMAL_SPECIES = ["Canino", "Felino", "Ave", "Roedor", "Réptil", "Equino", "Outro"] as const;

export const VET_PROCEDURES = [
  { id: "consulta", label: "Consulta" },
  { id: "vacina", label: "Vacinação" },
  { id: "cirurgia", label: "Cirurgia" },
  { id: "exame", label: "Exame" },
  { id: "banho_tosa", label: "Banho & Tosa" },
  { id: "internacao", label: "Internação" },
  { id: "emergencia", label: "Emergência" },
];
