import { describe, it, expect } from "vitest";
import { validarCPF } from "./cpf";

describe("CPF Validation — extended cases", () => {
  const validCPFs = [
    "529.982.247-25",
    "111.444.777-35",
    "123.456.789-09",
    "000.000.001-91",
  ];

  const invalidCPFs = [
    "000.000.000-00",
    "111.111.111-11",
    "222.222.222-22",
    "999.999.999-99",
    "529.982.247-26", // wrong check digit
    "123.456.789-00", // wrong check digit
    "12345",
    "",
    "abcdefghijk",
  ];

  validCPFs.forEach((cpf) => {
    it(`accepts valid CPF: ${cpf}`, () => {
      expect(validarCPF(cpf)).toBe(true);
    });
  });

  invalidCPFs.forEach((cpf) => {
    it(`rejects invalid CPF: ${cpf || "(empty)"}`, () => {
      expect(validarCPF(cpf)).toBe(false);
    });
  });
});
