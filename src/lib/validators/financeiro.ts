import { z } from "zod";

export const createMovimentacaoSchema = z.object({
  pacienteId: z.string().uuid().optional(),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  categoria: z.enum([
    "MATRICULA",
    "MENSALIDADE",
    "MEDICAMENTO",
    "TRANSPORTE",
    "ALIMENTACAO",
    "LAVANDERIA",
    "EXAME",
    "PROCEDIMENTO",
    "OUTRO",
  ]),
  descricao: z.string().min(2, "Descrição é obrigatória"),
  valor: z.number().positive("Valor deve ser positivo"),
  dataVencimento: z.string().transform((s) => new Date(s)),
  formaPagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

export type CreateMovimentacaoInput = z.infer<typeof createMovimentacaoSchema>;
