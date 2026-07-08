import { describe, it, expect } from "vitest";
import { withTenantFilter, MULTI_TENANT_ACTIVE } from "@/lib/prisma-tenant";
import { getFeatures, isFeatureEnabled, VERTICAL_FEATURES } from "@/lib/features";

describe("Multi-tenant Isolation", () => {
  it("MULTI_TENANT_ACTIVE is enabled", () => {
    expect(MULTI_TENANT_ACTIVE).toBe(true);
  });

  it("withTenantFilter adds tenantId to where clause", () => {
    const where = { status: "ATIVO", deletedAt: null };
    const result = withTenantFilter(where, "tenant-123");
    expect(result).toEqual({ status: "ATIVO", deletedAt: null, tenantId: "tenant-123" });
  });

  it("withTenantFilter passes through when no tenantId", () => {
    const where = { status: "ATIVO" };
    const result = withTenantFilter(where, null);
    expect(result).toEqual({ status: "ATIVO" });
  });

  it("withTenantFilter passes through when tenantId undefined", () => {
    const where = { nome: "Test" };
    const result = withTenantFilter(where, undefined);
    expect(result).toEqual({ nome: "Test" });
  });
});

describe("Feature Flags", () => {
  it("returns recovery features by default", () => {
    const features = getFeatures();
    expect(features.prontuario).toBe(true);
    expect(features.portalFamilia).toBe(true);
    expect(features.quartos).toBe(true);
  });

  it("clinic has no portalFamilia or quartos", () => {
    const features = getFeatures("clinic");
    expect(features.prontuario).toBe(true);
    expect(features.portalFamilia).toBe(false);
    expect(features.quartos).toBe(false);
    expect(features.crm).toBe(true);
  });

  it("restaurant has no prontuario", () => {
    const features = getFeatures("restaurant");
    expect(features.prontuario).toBe(false);
    expect(features.pdv).toBe(true);
    expect(features.delivery).toBe(true);
  });

  it("isFeatureEnabled works correctly", () => {
    expect(isFeatureEnabled("prontuario", "recovery")).toBe(true);
    expect(isFeatureEnabled("prontuario", "restaurant")).toBe(false);
  });

  it("all verticals are defined", () => {
    const verticals = Object.keys(VERTICAL_FEATURES);
    expect(verticals).toContain("recovery");
    expect(verticals).toContain("clinic");
    expect(verticals).toContain("hotel");
    expect(verticals).toContain("restaurant");
    expect(verticals).toContain("senior");
    expect(verticals).toContain("services");
  });
});
