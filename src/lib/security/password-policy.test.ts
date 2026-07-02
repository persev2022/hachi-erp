import { describe, it, expect } from "vitest";
import { validatePassword } from "./password-policy";

describe("validatePassword", () => {
  it("accepts strong password", () => {
    const result = validatePassword("Admin@2026");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects short password", () => {
    const result = validatePassword("Ab1!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Mínimo 8 caracteres");
  });

  it("rejects without uppercase", () => {
    const result = validatePassword("admin@2026");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Pelo menos 1 letra maiúscula");
  });

  it("rejects without lowercase", () => {
    const result = validatePassword("ADMIN@2026");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Pelo menos 1 letra minúscula");
  });

  it("rejects without number", () => {
    const result = validatePassword("Admin@Pass");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Pelo menos 1 número");
  });

  it("rejects without special char", () => {
    const result = validatePassword("Admin2026x");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Pelo menos 1 caractere especial (!@#$%...)");
  });
});
