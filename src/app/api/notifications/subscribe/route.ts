import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Store push subscription for a user
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ success: false, error: "Subscription inválida" }, { status: 400 });
    }

    const configKey = `push_sub_${session.tenantId || "global"}_${session.userId}`;

    // Store in SystemConfig per user
    await prisma.systemConfig.upsert({
      where: { key: configKey },
      create: {
        key: configKey,
        value: JSON.stringify({
          subscription,
          userId: session.userId,
          tenantId: session.tenantId,
          createdAt: new Date().toISOString(),
        }),
      },
      update: {
        value: JSON.stringify({
          subscription,
          userId: session.userId,
          tenantId: session.tenantId,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, message: "Notificações ativadas" });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ success: false, error: "Erro ao registrar" }, { status: 500 });
  }
}

// Unsubscribe
export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const configKey = `push_sub_${session.tenantId || "global"}_${session.userId}`;
    await prisma.systemConfig.delete({ where: { key: configKey } }).catch(() => {});

    return NextResponse.json({ success: true, message: "Notificações desativadas" });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ success: false, error: "Erro ao desregistrar" }, { status: 500 });
  }
}
