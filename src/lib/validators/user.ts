import { z } from "zod";

export const ROLES = [
  "ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA",
  "SECRETARIA", "FINANCEIRO", "MONITOR", "APOIO",
] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: z.enum(ROLES),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  crm: z.string().optional(),
  crp: z.string().optional(),
  coren: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(ROLES).optional(),
  password: z.string().min(8).optional(),
  active: z.boolean().optional(),
  phone: z.string().optional(),
  crm: z.string().optional(),
  crp: z.string().optional(),
  coren: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
