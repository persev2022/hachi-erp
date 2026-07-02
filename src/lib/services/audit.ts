import { prisma } from "@/lib/prisma";

export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: object
) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details: details as any,
    },
  });
}
