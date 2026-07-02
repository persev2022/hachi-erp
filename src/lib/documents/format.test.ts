import { describe, it, expect } from "vitest";
import {
  toSlug,
  toTitleCase,
  formatDateBR,
  dataParaExtenso,
  parseDateBR,
  diasParaMeses,
  somarMeses,
  calcularPrimeiroVencimento,
} from "./format";

describe("toSlug", () => {
  it("converts name to kebab-case", () => {
    expect(toSlug("João Da Silva")).toBe("joao-da-silva");
  });

  it("removes special characters", () => {
    expect(toSlug("Nome/Com:Chars*Especiais")).toBe("nomecomcharsespeciais");
  });

  it("handles multiple spaces", () => {
    expect(toSlug("  Nome   Completo  ")).toBe("nome-completo");
  });
});

describe("toTitleCase", () => {
  it("capitalizes each word", () => {
    expect(toTitleCase("JOÃO DA SILVA")).toBe("João Da Silva");
  });

  it("handles lowercase input", () => {
    expect(toTitleCase("maria")).toBe("Maria");
  });
});

describe("formatDateBR", () => {
  it("formats Date to dd/MM/yyyy", () => {
    const result = formatDateBR(new Date(2026, 6, 1)); // July 1, 2026
    expect(result).toBe("01/07/2026");
  });

  it("accepts ISO string", () => {
    const result = formatDateBR("2026-03-15T00:00:00");
    expect(result).toBe("15/03/2026");
  });
});

describe("dataParaExtenso", () => {
  it("converts Date to extenso", () => {
    const result = dataParaExtenso(new Date(2026, 5, 1)); // June 1
    expect(result).toBe("1 de junho de 2026");
  });
});

describe("parseDateBR", () => {
  it("parses dd/MM/yyyy to Date", () => {
    const result = parseDateBR("15/03/2026");
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(2); // March = 2
    expect(result.getFullYear()).toBe(2026);
  });

  it("throws on invalid format", () => {
    expect(() => parseDateBR("2026-03-15")).toThrow();
  });

  it("throws on invalid date (31/02)", () => {
    expect(() => parseDateBR("31/02/2026")).toThrow();
  });
});

describe("diasParaMeses", () => {
  it("converts 90 days to 3 months", () => {
    expect(diasParaMeses(90)).toBe(3);
  });

  it("converts 180 days to 6 months", () => {
    expect(diasParaMeses(180)).toBe(6);
  });

  it("rounds 45 days to 2 months", () => {
    expect(diasParaMeses(45)).toBe(2);
  });
});

describe("somarMeses", () => {
  it("adds months to a date", () => {
    const base = new Date(2026, 0, 15); // Jan 15
    const result = somarMeses(base, 3);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(15);
  });
});

describe("calcularPrimeiroVencimento", () => {
  it("returns next month with given day", () => {
    const entrada = new Date(2026, 5, 23); // June 23
    const result = calcularPrimeiroVencimento(entrada, 20);
    expect(result.getMonth()).toBe(6); // July
    expect(result.getDate()).toBe(20);
  });
});
