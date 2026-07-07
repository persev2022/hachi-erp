/**
 * Tenant-aware Prisma client utilities.
 *
 * Phase 2: Active infrastructure — provides tenant-scoped queries.
 * The global prisma client remains unaffected (no breaking changes).
 * Use `getTenantPrisma(tenantId)` in routes that need tenant isolation.
 */

import { prisma } from "@/lib/prisma";

// Whether multi-tenant filtering is active globally
// Set to true when ready to enforce isolation
export const MULTI_TENANT_ACTIVE = true;

/**
 * Get a tenant-scoped Prisma client.
 * When MULTI_TENANT_ACTIVE is false, returns standard prisma (no filtering).
 * When activated, adds tenantId to all applicable where clauses.
 */
export function getTenantPrisma(tenantId?: string | null) {
  if (!MULTI_TENANT_ACTIVE || !tenantId) {
    return prisma;
  }

  // Extended client with automatic tenant filter
  return prisma.$extends({
    query: {
      paciente: {
        findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        findFirst({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
      quarto: {
        findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
      movimentacaoFinanceira: {
        findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        aggregate({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
      itemEstoque: {
        findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
      comunicacao: {
        findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
    },
  });
}

/**
 * Helper to include tenantId in create operations.
 */
export function withTenant<T extends Record<string, unknown>>(
  data: T,
  tenantId?: string | null
): T {
  if (!tenantId) return data;
  return { ...data, tenantId };
}

/**
 * Helper to add tenantId filter to where clauses.
 * Active when MULTI_TENANT_ACTIVE is true.
 */
export function withTenantFilter<T extends Record<string, unknown>>(
  where: T,
  tenantId?: string | null
): T {
  if (!MULTI_TENANT_ACTIVE || !tenantId) return where;
  return { ...where, tenantId };
}
