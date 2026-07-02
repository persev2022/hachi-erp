import { describe, it, expect } from "vitest";
import { renderTemplate, getTemplates, getTemplateById } from "./templates";

describe("Message Templates", () => {
  it("getTemplates returns all default templates", () => {
    const templates = getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(5);
    expect(templates.every((t) => t.id && t.nome && t.conteudo)).toBe(true);
  });

  it("getTemplateById finds template", () => {
    const t = getTemplateById("lembrete-consulta");
    expect(t).toBeDefined();
    expect(t!.nome).toBe("Lembrete de Consulta");
  });

  it("getTemplateById returns undefined for invalid id", () => {
    expect(getTemplateById("non-existent")).toBeUndefined();
  });

  it("renderTemplate replaces variables", () => {
    const t = getTemplateById("lembrete-consulta")!;
    const result = renderTemplate(t, {
      nome_paciente: "João",
      tipo_consulta: "Terapia Individual",
      data: "10/07/2026",
      hora: "09:00",
      profissional: "Dr. Marcos",
    });
    expect(result).toContain("João");
    expect(result).toContain("Terapia Individual");
    expect(result).toContain("10/07/2026");
    expect(result).toContain("09:00");
    expect(result).toContain("Dr. Marcos");
    expect(result).not.toContain("{{");
  });

  it("renderTemplate handles missing variables gracefully", () => {
    const t = getTemplateById("aviso-geral")!;
    const result = renderTemplate(t, {}); // no data provided
    expect(result).toContain("{{mensagem}}"); // unreplaced
  });
});
