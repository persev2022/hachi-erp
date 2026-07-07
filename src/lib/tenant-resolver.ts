/**
 * Tenant Resolution Strategies
 *
 * Resolves which tenant a request belongs to.
 * Supports multiple strategies for flexibility:
 *
 * 1. JWT payload (current — tenantId from session)
 * 2. Subdomain (future — clinic.hachi.app → tenant "clinic")
 * 3. Custom header (future — X-Tenant-Id for API consumers)
 * 4. Path prefix (future — /t/clinic/dashboard)
 */

import { NextRequest } from "next/server";

export type TenantResolutionStrategy = "jwt" | "subdomain" | "header" | "path";

// Active strategy — change this to switch between resolution methods
export const TENANT_RESOLUTION_STRATEGY: TenantResolutionStrategy = "jwt";

/**
 * Resolve tenant slug from subdomain.
 * Example: clinic.hachi-erp.vercel.app → "clinic"
 * Example: ct-persev.hachi.app → "ct-persev"
 */
export function resolveTenantFromSubdomain(req: NextRequest): string | null {
  const host = req.headers.get("host") || "";

  // Skip for localhost
  if (host.includes("localhost")) return null;

  // Extract subdomain: "clinic.hachi-erp.vercel.app" → "clinic"
  const parts = host.split(".");

  // Needs at least 3 parts to have a subdomain (sub.domain.tld)
  // For vercel: sub.hachi-erp.vercel.app (4 parts)
  // For custom domain: sub.hachi.app (3 parts)
  if (parts.length >= 4) {
    // Vercel pattern: xxx.hachi-erp.vercel.app
    const subdomain = parts[0];
    if (subdomain !== "www" && subdomain !== "hachi-erp") {
      return subdomain;
    }
  } else if (parts.length === 3) {
    // Custom domain pattern: xxx.hachi.app
    const subdomain = parts[0];
    if (subdomain !== "www" && subdomain !== "app") {
      return subdomain;
    }
  }

  return null;
}

/**
 * Resolve tenant from custom header (for API clients).
 */
export function resolveTenantFromHeader(req: NextRequest): string | null {
  return req.headers.get("x-tenant-slug") || null;
}

/**
 * Resolve tenant from URL path prefix.
 * Example: /t/clinic/dashboard → "clinic"
 */
export function resolveTenantFromPath(req: NextRequest): string | null {
  const { pathname } = req.nextUrl;
  const match = pathname.match(/^\/t\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Main resolver — uses configured strategy.
 * Returns tenant slug or null (default tenant).
 */
export function resolveTenant(req: NextRequest): string | null {
  switch (TENANT_RESOLUTION_STRATEGY) {
    case "subdomain":
      return resolveTenantFromSubdomain(req);
    case "header":
      return resolveTenantFromHeader(req);
    case "path":
      return resolveTenantFromPath(req);
    case "jwt":
    default:
      return null; // JWT strategy resolves from session, not from request
  }
}
