import { z } from "zod";

export const createPrescricaoSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  medicamento: z.string().min(2, "Medicamento é obrigatório"),
  dosagem: z.string().min(1, "Dosagem é obrigatória"),
  via: z.string().min(1, "Via de administração é obrigatória"),
  frequencia: z.string().min(1, "Frequência é obrigatória"),
  duracao: z.string().optional(),
  observacoes: z.string().optional(),
});

export type CreatePrescricaoInput = z.infer<typeof createPrescricaoSchema>;
