export const VERTICAL_ID = "hotel";
export const VERTICAL_NAME = "Hachi Hotel";
export const VERTICAL_DESCRIPTION = "Hotéis, Pousadas, Hostels e Resorts";

export const HOTEL_TERMINOLOGY = {
  paciente: "Hóspede",
  evolucao: "Registro",
  admissao: "Check-in",
  alta: "Check-out",
  quarto: "UH",
  quartos: "Unidades Habitacionais",
  diasTratamento: "Diárias",
  portalFamilia: "Portal do Hóspede",
  acolhido: "Hóspede",
};

export const ROOM_TYPES = [
  { id: "standard", label: "Standard", baseRate: 150 },
  { id: "superior", label: "Superior", baseRate: 250 },
  { id: "luxo", label: "Luxo", baseRate: 400 },
  { id: "suite", label: "Suíte", baseRate: 600 },
  { id: "presidencial", label: "Presidencial", baseRate: 1200 },
];

export const BOOKING_STATUS = ["RESERVADO", "CHECKIN", "HOSPEDADO", "CHECKOUT", "CANCELADO", "NO_SHOW"] as const;
