import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════

export type NotificationType = "info" | "warning" | "error" | "success";

export interface Notification {
  id: string;
  tenantId: string | null;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  createdAt: Date;
}

export interface CreateNotificationParams {
  tenantId?: string | null;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Creates a new notification for a user.
 */
export async function createNotification(params: CreateNotificationParams): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      tenantId: params.tenantId ?? null,
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
      link: params.link ?? null,
    },
  });

  return notification as Notification;
}

/**
 * Returns the count of unread notifications for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

/**
 * Marks a single notification as read.
 */
export async function markAsRead(notificationId: string): Promise<Notification> {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return notification as Notification;
}

/**
 * Marks multiple notifications as read.
 */
export async function markManyAsRead(notificationIds: string[]): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { id: { in: notificationIds } },
    data: { read: true },
  });

  return result.count;
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return result.count;
}

/**
 * Gets recent notifications for a user (last N, newest first).
 */
export async function getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications as Notification[];
}
