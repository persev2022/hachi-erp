import { describe, it, expect } from "vitest";
import { createEvolucaoSchema } from "./evolucao";

describe("createEvolucaoSchema", () => {
  const valid = {
    pacienteId: "550e8400-e29b-41d4-a716-446655440000",
    tipo: "MEDICA",
    conteudo: "Paciente estável, sem queixas novas. Apetite preservado.",
  };

  it("accepts valid payload", () => {
    const result = createEvolucaoSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects short conteudo", () => {
    const result = createEvolucaoSchema.safeParse({ ...valid, conteudo: "curto" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tipo", () => {
    const result = createEvolucaoSchema.safeParse({ ...valid, tipo: "INVALIDO" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pacienteId", () => {
    const result = createEvolucaoSchema.safeParse({ ...valid, pacienteId: "not-uuid" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid tipos", () => {
    for (const tipo of ["MEDICA", "PSICOLOGICA", "ENFERMAGEM", "TERAPEUTICA", "SOCIAL", "NUTRICIONAL"]) {
      const result = createEvolucaoSchema.safeParse({ ...valid, tipo });
      expect(result.success).toBe(true);
    }
  });

  it("accepts optional sinaisVitais", () => {
    const result = createEvolucaoSchema.safeParse({
      ...valid,
      sinaisVitais: { pa: "120x80", fc: 72, temp: 36.5 },
    });
    expect(result.success).toBe(true);
  });
});
