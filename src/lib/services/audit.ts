import { prisma } from "@/lib/prisma";

/**
 * Log an audit event with optional IP address tracking.
 * All actions in the system should be tracked through this function.
 */
export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: object,
  ipAddress?: string | null
) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId || undefined,
        details: details as any,
        ipAddress: ipAddress || undefined,
      },
    });
  } catch (error) {
    // Never let audit logging crash the main operation
    console.error("Audit log failed:", error);
    return null;
  }
}

/**
 * Extract IP address from Next.js request headers
 */
export function getIpFromRequest(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return null;
}
