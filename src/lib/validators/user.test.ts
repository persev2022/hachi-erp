import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserSchema } from "./user";

describe("createUserSchema", () => {
  const valid = {
    name: "Dr. João Silva",
    email: "joao@hachi.com",
    password: "Senha@123",
    role: "MEDICO",
  };

  it("accepts valid payload", () => {
    const result = createUserSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = createUserSchema.safeParse({ ...valid, email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = createUserSchema.safeParse({ ...valid, password: "Abc1!" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = createUserSchema.safeParse({ ...valid, role: "INVALIDO" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid roles", () => {
    const roles = ["ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA", "FINANCEIRO", "MONITOR", "APOIO"];
    for (const role of roles) {
      const result = createUserSchema.safeParse({ ...valid, role });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateUserSchema", () => {
  it("accepts partial update (name only)", () => {
    const result = updateUserSchema.safeParse({ name: "Novo Nome" });
    expect(result.success).toBe(true);
  });

  it("accepts deactivation", () => {
    const result = updateUserSchema.safeParse({ active: false });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role on update", () => {
    const result = updateUserSchema.safeParse({ role: "INVALIDO" });
    expect(result.success).toBe(false);
  });
});
