import { describe, it, expect } from "vitest";
import { createPrescricaoSchema } from "./prescricao";

describe("createPrescricaoSchema", () => {
  const valid = {
    pacienteId: "550e8400-e29b-41d4-a716-446655440000",
    medicamento: "Clonazepam 2mg",
    dosagem: "1 comprimido",
    via: "Oral",
    frequencia: "8/8h",
  };

  it("accepts valid payload", () => {
    const result = createPrescricaoSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty medicamento", () => {
    const result = createPrescricaoSchema.safeParse({ ...valid, medicamento: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty dosagem", () => {
    const result = createPrescricaoSchema.safeParse({ ...valid, dosagem: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty via", () => {
    const result = createPrescricaoSchema.safeParse({ ...valid, via: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pacienteId", () => {
    const result = createPrescricaoSchema.safeParse({ ...valid, pacienteId: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts optional duracao", () => {
    const result = createPrescricaoSchema.safeParse({ ...valid, duracao: "7 dias" });
    expect(result.success).toBe(true);
  });

  it("accepts optional observacoes", () => {
    const result = createPrescricaoSchema.safeParse({ ...valid, observacoes: "Tomar em jejum" });
    expect(result.success).toBe(true);
  });
});
