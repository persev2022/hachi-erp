import { z } from "zod";

export const createAgendamentoSchema = z.object({
  pacienteId: z.string().uuid("ID do paciente inválido"),
  profissionalId: z.string().uuid("ID do profissional inválido"),
  tipo: z.string().min(1, "Tipo de atendimento é obrigatório"),
  dataHora: z.string().transform((s) => new Date(s)),
  duracao: z.number().int().min(10).max(480).default(50),
  observacoes: z.string().optional(),
  sala: z.string().optional(),
});

export type CreateAgendamentoInput = z.infer<typeof createAgendamentoSchema>;
