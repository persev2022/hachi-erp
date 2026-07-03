import { describe, it, expect } from "vitest";
import { formatarValorNum, formatarValorContrato, formatarValor } from "./valor";

describe("valor.ts", () => {
  describe("formatarValorNum", () => {
    it("formats integer", () => {
      expect(formatarValorNum(1500)).toBe("1.500,00");
    });

    it("formats decimals", () => {
      expect(formatarValorNum(99.9)).toBe("99,90");
    });

    it("formats zero", () => {
      expect(formatarValorNum(0)).toBe("0,00");
    });
  });

  describe("formatarValorContrato", () => {
    it("formats with extenso", () => {
      const result = formatarValorContrato(2000);
      expect(result).toContain("R$2.000,00");
      expect(result).toContain("(");
      expect(result).toContain(")");
    });
  });

  describe("formatarValor", () => {
    it("returns valorNum and valorExtenso", () => {
      const { valorNum, valorExtenso } = formatarValor(1500);
      expect(valorNum).toBe("1.500,00");
      expect(valorExtenso.length).toBeGreaterThan(5);
    });
  });
});
