import { z } from "zod";

export const createEvolucaoSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  tipo: z.enum(["MEDICA", "PSICOLOGICA", "ENFERMAGEM", "TERAPEUTICA", "SOCIAL", "NUTRICIONAL"]),
  conteudo: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  sinaisVitais: z
    .object({
      pa: z.string().optional(),
      fc: z.number().optional(),
      fr: z.number().optional(),
      temp: z.number().optional(),
      spo2: z.number().optional(),
      peso: z.number().optional(),
    })
    .optional(),
});

export type CreateEvolucaoInput = z.infer<typeof createEvolucaoSchema>;
