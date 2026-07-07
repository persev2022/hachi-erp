/**
 * Multi-tenant utilities for Hachi Platform
 *
 * Phase 1: Infrastructure only — no behavior change.
 * All functions return the default tenant until multi-tenant is activated.
 *
 * When multi-tenant is active:
 * - JWT includes tenantId
 * - All queries filter by tenantId
 * - Users see only their tenant's data
 */

import { prisma } from "@/lib/prisma";

// Default tenant slug (CT Persev — first tenant, backwards compatible)
export const DEFAULT_TENANT_SLUG = "ct-persev";

// Feature flags type for tenants
export interface TenantFeatures {
  // Core modules (always available)
  financeiro: boolean;
  agenda: boolean;
  documentos: boolean;
  estoque: boolean;
  comunicacao: boolean;
  relatorios: boolean;

  // Vertical-specific modules
  prontuario: boolean; // Recovery, Clinic, Senior
  portalFamilia: boolean; // Recovery, Senior, Education
  quartos: boolean; // Recovery, Hotel, Senior
  prescricoes: boolean; // Recovery, Clinic

  // Future modules
  crm: boolean;
  pdv: boolean;
  delivery: boolean;
  reservas: boolean;
}

// Default features for Recovery vertical (current Hachi)
export const RECOVERY_FEATURES: TenantFeatures = {
  financeiro: true,
  agenda: true,
  documentos: true,
  estoque: true,
  comunicacao: true,
  relatorios: true,
  prontuario: true,
  portalFamilia: true,
  quartos: true,
  prescricoes: true,
  crm: false,
  pdv: false,
  delivery: false,
  reservas: false,
};

// Get tenant by slug (cached in production)
export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({ where: { slug } });
}

// Get tenant features (returns default Recovery features if not configured)
export function getTenantFeatures(config: any): TenantFeatures {
  if (!config?.features) return RECOVERY_FEATURES;
  return { ...RECOVERY_FEATURES, ...config.features };
}

// Resolve tenant from session (for future use)
export async function resolveTenantFromUserId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });
  return user?.tenantId || null;
}
