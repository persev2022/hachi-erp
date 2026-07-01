import { prisma } from "@/lib/prisma";

export type AuditAction = "CREATE" | "READ" | "UPDATE" | "DELETE";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Registra um evento de auditoria.
 * Usado em toda operação de escrita no prontuário e dados sensíveis.
 * Logs são imutáveis (append-only).
 */
export async function logAudit(entry: AuditEntry) {
  return prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      details: entry.details as object | undefined,
      ipAddress: entry.ipAddress,
    },
  });
}

/**
 * Busca logs de auditoria com filtros.
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  return prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      entity: filters.entity,
      entityId: filters.entityId,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: filters.limit || 100,
  });
}
