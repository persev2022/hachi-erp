import { describe, it, expect } from "vitest";
import { createMovimentacaoSchema } from "./financeiro";

describe("createMovimentacaoSchema", () => {
  const valid = {
    tipo: "RECEITA",
    categoria: "MENSALIDADE",
    descricao: "Mensalidade Julho",
    valor: 2000,
    dataVencimento: "2026-07-05",
  };

  it("accepts valid payload", () => {
    const result = createMovimentacaoSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects negative valor", () => {
    const result = createMovimentacaoSchema.safeParse({ ...valid, valor: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects zero valor", () => {
    const result = createMovimentacaoSchema.safeParse({ ...valid, valor: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tipo", () => {
    const result = createMovimentacaoSchema.safeParse({ ...valid, tipo: "OUTRO" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid categoria", () => {
    const result = createMovimentacaoSchema.safeParse({ ...valid, categoria: "INVALIDA" });
    expect(result.success).toBe(false);
  });

  it("accepts optional pacienteId UUID", () => {
    const result = createMovimentacaoSchema.safeParse({
      ...valid,
      pacienteId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid pacienteId (not UUID)", () => {
    const result = createMovimentacaoSchema.safeParse({ ...valid, pacienteId: "not-uuid" });
    expect(result.success).toBe(false);
  });
});
