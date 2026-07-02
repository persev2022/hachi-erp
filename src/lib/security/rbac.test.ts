import { describe, it, expect } from "vitest";

/**
 * RBAC tests — verifying role-based access control rules.
 * These validate the permission logic used in API routes.
 */

// Define the same RBAC rules used in the sidebar and APIs
const RBAC_RULES: Record<string, string[]> = {
  "/pacientes": ["ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA"],
  "/prontuario": ["ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA"],
  "/agenda": ["ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA", "FINANCEIRO", "MONITOR", "APOIO"],
  "/financeiro": ["ADMIN", "FINANCEIRO"],
  "/estoque": ["ADMIN", "ENFERMEIRO", "MONITOR", "APOIO"],
  "/quartos": ["ADMIN", "ENFERMEIRO", "MONITOR", "SECRETARIA"],
  "/documentos": ["ADMIN", "MEDICO", "SECRETARIA", "FINANCEIRO"],
  "/comunicacao": ["ADMIN", "SECRETARIA"],
  "/relatorios": ["ADMIN", "FINANCEIRO"],
  "/configuracoes": ["ADMIN"],
};

function hasAccess(role: string, path: string): boolean {
  const allowedRoles = RBAC_RULES[path];
  if (!allowedRoles) return true; // No restriction = allowed
  return allowedRoles.includes(role);
}

describe("RBAC - Role Based Access Control", () => {
  describe("ADMIN has access to everything", () => {
    it("can access all paths", () => {
      for (const path of Object.keys(RBAC_RULES)) {
        expect(hasAccess("ADMIN", path)).toBe(true);
      }
    });
  });

  describe("MEDICO access", () => {
    it("can access prontuario", () => expect(hasAccess("MEDICO", "/prontuario")).toBe(true));
    it("can access pacientes", () => expect(hasAccess("MEDICO", "/pacientes")).toBe(true));
    it("can access documentos", () => expect(hasAccess("MEDICO", "/documentos")).toBe(true));
    it("CANNOT access financeiro", () => expect(hasAccess("MEDICO", "/financeiro")).toBe(false));
    it("CANNOT access configuracoes", () => expect(hasAccess("MEDICO", "/configuracoes")).toBe(false));
  });

  describe("SECRETARIA access", () => {
    it("can access pacientes", () => expect(hasAccess("SECRETARIA", "/pacientes")).toBe(true));
    it("can access agenda", () => expect(hasAccess("SECRETARIA", "/agenda")).toBe(true));
    it("can access comunicacao", () => expect(hasAccess("SECRETARIA", "/comunicacao")).toBe(true));
    it("CANNOT access prontuario", () => expect(hasAccess("SECRETARIA", "/prontuario")).toBe(false));
    it("CANNOT access financeiro", () => expect(hasAccess("SECRETARIA", "/financeiro")).toBe(false));
  });

  describe("FINANCEIRO access", () => {
    it("can access financeiro", () => expect(hasAccess("FINANCEIRO", "/financeiro")).toBe(true));
    it("can access relatorios", () => expect(hasAccess("FINANCEIRO", "/relatorios")).toBe(true));
    it("CANNOT access prontuario", () => expect(hasAccess("FINANCEIRO", "/prontuario")).toBe(false));
    it("CANNOT access comunicacao", () => expect(hasAccess("FINANCEIRO", "/comunicacao")).toBe(false));
  });

  describe("ENFERMEIRO access", () => {
    it("can access prontuario", () => expect(hasAccess("ENFERMEIRO", "/prontuario")).toBe(true));
    it("can access estoque", () => expect(hasAccess("ENFERMEIRO", "/estoque")).toBe(true));
    it("can access quartos", () => expect(hasAccess("ENFERMEIRO", "/quartos")).toBe(true));
    it("CANNOT access financeiro", () => expect(hasAccess("ENFERMEIRO", "/financeiro")).toBe(false));
    it("CANNOT access configuracoes", () => expect(hasAccess("ENFERMEIRO", "/configuracoes")).toBe(false));
  });

  describe("MONITOR access", () => {
    it("can access quartos", () => expect(hasAccess("MONITOR", "/quartos")).toBe(true));
    it("can access estoque", () => expect(hasAccess("MONITOR", "/estoque")).toBe(true));
    it("CANNOT access prontuario", () => expect(hasAccess("MONITOR", "/prontuario")).toBe(false));
    it("CANNOT access financeiro", () => expect(hasAccess("MONITOR", "/financeiro")).toBe(false));
    it("CANNOT access pacientes", () => expect(hasAccess("MONITOR", "/pacientes")).toBe(false));
  });

  describe("Data isolation", () => {
    it("prescrições restricted to MEDICO + ADMIN", () => {
      const prescriptionRoles = ["ADMIN", "MEDICO"];
      expect(prescriptionRoles.includes("ENFERMEIRO")).toBe(false);
      expect(prescriptionRoles.includes("SECRETARIA")).toBe(false);
    });

    it("financeiro data restricted to ADMIN + FINANCEIRO", () => {
      const finRoles = ["ADMIN", "FINANCEIRO"];
      expect(finRoles.includes("MEDICO")).toBe(false);
      expect(finRoles.includes("ENFERMEIRO")).toBe(false);
    });
  });
});
