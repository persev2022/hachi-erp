import { describe, it, expect } from "vitest";
import { validarCPF } from "./cpf";

describe("validarCPF", () => {
  it("accepts valid CPF", () => {
    expect(validarCPF("529.982.247-25")).toBe(true);
    expect(validarCPF("52998224725")).toBe(true);
  });

  it("rejects all same digits", () => {
    expect(validarCPF("111.111.111-11")).toBe(false);
    expect(validarCPF("000.000.000-00")).toBe(false);
  });

  it("rejects wrong check digits", () => {
    expect(validarCPF("529.982.247-26")).toBe(false);
    expect(validarCPF("12345678901")).toBe(false);
  });

  it("rejects short input", () => {
    expect(validarCPF("123")).toBe(false);
    expect(validarCPF("")).toBe(false);
  });
});
