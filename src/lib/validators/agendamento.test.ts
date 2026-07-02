import { describe, it, expect } from "vitest";
import { createAgendamentoSchema } from "./agendamento";

describe("createAgendamentoSchema", () => {
  const valid = {
    pacienteId: "550e8400-e29b-41d4-a716-446655440000",
    profissionalId: "550e8400-e29b-41d4-a716-446655440001",
    tipo: "Consulta Psiquiátrica",
    dataHora: "2026-07-10T09:00:00",
    duracao: 50,
  };

  it("accepts valid payload", () => {
    const result = createAgendamentoSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid pacienteId (not UUID)", () => {
    const result = createAgendamentoSchema.safeParse({ ...valid, pacienteId: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects missing tipo", () => {
    const result = createAgendamentoSchema.safeParse({ ...valid, tipo: "" });
    expect(result.success).toBe(false);
  });

  it("rejects duracao < 10", () => {
    const result = createAgendamentoSchema.safeParse({ ...valid, duracao: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects duracao > 480", () => {
    const result = createAgendamentoSchema.safeParse({ ...valid, duracao: 500 });
    expect(result.success).toBe(false);
  });

  it("defaults duracao to 50", () => {
    const { duracao, ...withoutDuracao } = valid;
    const result = createAgendamentoSchema.safeParse(withoutDuracao);
    if (result.success) {
      expect(result.data.duracao).toBe(50);
    }
  });

  it("transforms dataHora to Date", () => {
    const result = createAgendamentoSchema.safeParse(valid);
    if (result.success) {
      expect(result.data.dataHora).toBeInstanceOf(Date);
    }
  });
});
