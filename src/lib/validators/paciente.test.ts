import { describe, it, expect } from "vitest";
import { createPacienteSchema, updatePacienteSchema } from "./paciente";

describe("createPacienteSchema", () => {
  const validPayload = {
    nome: "João da Silva",
    cpf: "12345678900",
    dataNascimento: "1990-05-15",
    sexo: "M",
    estadoCivil: "SOLTEIRO",
    dataAdmissao: "2026-07-01",
    diasTratamento: 90,
  };

  it("accepts a valid minimal payload", () => {
    const result = createPacienteSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects missing nome", () => {
    const result = createPacienteSchema.safeParse({ ...validPayload, nome: "" });
    expect(result.success).toBe(false);
  });

  it("rejects CPF with less than 11 chars", () => {
    const result = createPacienteSchema.safeParse({ ...validPayload, cpf: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid estadoCivil", () => {
    const result = createPacienteSchema.safeParse({ ...validPayload, estadoCivil: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects diasTratamento < 1", () => {
    const result = createPacienteSchema.safeParse({ ...validPayload, diasTratamento: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts optional responsavel", () => {
    const result = createPacienteSchema.safeParse({
      ...validPayload,
      responsavel: {
        nome: "Maria da Silva",
        cpf: "98765432100",
        parentesco: "Mãe",
        telefone: "48999990001",
        isFinanceiro: true,
      },
    });
    expect(result.success).toBe(true);
  });

  it("transforms date strings to Date objects", () => {
    const result = createPacienteSchema.safeParse(validPayload);
    if (result.success) {
      expect(result.data.dataNascimento).toBeInstanceOf(Date);
      expect(result.data.dataAdmissao).toBeInstanceOf(Date);
    }
  });

  it("defaults internacoesPrevias to 0", () => {
    const result = createPacienteSchema.safeParse(validPayload);
    if (result.success) {
      expect(result.data.internacoesPrevias).toBe(0);
    }
  });
});

describe("updatePacienteSchema", () => {
  it("accepts partial updates", () => {
    const result = updatePacienteSchema.safeParse({ nome: "Novo Nome" });
    expect(result.success).toBe(true);
  });

  it("accepts status change", () => {
    const result = updatePacienteSchema.safeParse({ status: "ALTA" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updatePacienteSchema.safeParse({ status: "INVALIDO" });
    expect(result.success).toBe(false);
  });

  it("accepts empty object (no changes)", () => {
    const result = updatePacienteSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
