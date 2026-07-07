/**
 * Tenant-aware Prisma client utilities.
 *
 * Usage in API routes:
 *   const session = await getSessionFromRequest(req);
 *   const tenantId = session?.tenantId;
 *   // For now, tenantId is informational only.
 *   // When multi-tenant is fully active, use getTenantPrisma(tenantId) for filtered queries.
 *
 * This file provides the foundation for Phase 2 activation.
 * Currently: exports helpers but does NOT modify global prisma behavior.
 */

import { prisma } from "@/lib/prisma";

/**
 * Get a tenant-scoped query helper.
 * For now, returns the standard prisma client.
 * In Phase 2, this will return an extended client with automatic where filters.
 */
export function getTenantPrisma(_tenantId?: string | null) {
  // Phase 1: return standard prisma (no filtering)
  // Phase 2: will use Prisma.$extends to add automatic tenantId filter
  return prisma;
}

/**
 * Helper to add tenantId to a create payload if available.
 * Use this when creating records to future-proof them for multi-tenant.
 */
export function withTenant<T extends Record<string, unknown>>(
  data: T,
  tenantId?: string | null
): T {
  if (!tenantId) return data;
  return { ...data, tenantId };
}

/**
 * Helper to add tenantId filter to a where clause if available.
 * For Phase 2 activation — currently a pass-through.
 */
export function withTenantFilter<T extends Record<string, unknown>>(
  where: T,
  _tenantId?: string | null
): T {
  // Phase 1: no-op (don't filter by tenant yet)
  // Phase 2: return { ...where, tenantId } when activated
  return where;
}
