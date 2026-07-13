import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Send push notification to specific users or all users of a tenant
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Apenas admins podem enviar notificações" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, message, targetUserId } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "title e message são obrigatórios" }, { status: 400 });
    }

    // Get subscriptions for this tenant
    const keyPrefix = targetUserId
      ? `push_sub_${session.tenantId || "global"}_${targetUserId}`
      : `push_sub_${session.tenantId || "global"}_`;

    const configs = await prisma.systemConfig.findMany({
      where: {
        key: targetUserId ? keyPrefix : { startsWith: keyPrefix },
      },
    });

    // In production, use web-push library to send via VAPID
    // For now, store as in-app notification
    const notificationPayload = {
      title,
      body: message,
      icon: "/images/hachi-logo.png",
      badge: "/images/hachi-logo.png",
      timestamp: Date.now(),
    };

    // Store notification for in-app delivery
    await prisma.systemConfig.create({
      data: {
        key: `notification_${session.tenantId || "global"}_${Date.now()}`,
        value: JSON.stringify({
          ...notificationPayload,
          targetUserId: targetUserId || "all",
          sentBy: session.userId,
          tenantId: session.tenantId,
          sentAt: new Date().toISOString(),
          read: false,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sent: configs.length,
        notification: notificationPayload,
      },
    });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json({ success: false, error: "Erro ao enviar" }, { status: 500 });
  }
}
