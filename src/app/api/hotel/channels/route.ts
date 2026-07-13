import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Channel Manager API — Manages OTA connections and rate/availability sync
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: `channels_${session.tenantId}` },
    });

    const channels = config ? JSON.parse(config.value) : {
      channels: [
        { id: "booking", name: "Booking.com", status: "disconnected", commission: 15, lastSync: null },
        { id: "airbnb", name: "Airbnb", status: "disconnected", commission: 3, lastSync: null },
        { id: "expedia", name: "Expedia", status: "disconnected", commission: 18, lastSync: null },
        { id: "decolar", name: "Decolar", status: "disconnected", commission: 12, lastSync: null },
        { id: "direct", name: "Reserva Direta", status: "active", commission: 0, lastSync: new Date().toISOString() },
      ],
      settings: { autoSync: true, syncInterval: 15, overbookProtection: true },
    };

    return NextResponse.json({ success: true, data: channels });
  } catch (error) {
    console.error("Channels GET error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, channelId, credentials } = body;

    if (action === "connect") {
      // Store channel connection
      const configKey = `channels_${session.tenantId}`;
      const existing = await prisma.systemConfig.findFirst({ where: { key: configKey } });
      const data = existing ? JSON.parse(existing.value) : { channels: [], settings: {} };

      const channelIdx = data.channels.findIndex((c: any) => c.id === channelId);
      if (channelIdx >= 0) {
        data.channels[channelIdx].status = "active";
        data.channels[channelIdx].lastSync = new Date().toISOString();
        data.channels[channelIdx].credentials = credentials ? "configured" : null;
      }

      await prisma.systemConfig.upsert({
        where: { key: configKey },
        create: { key: configKey, value: JSON.stringify(data) },
        update: { value: JSON.stringify(data) },
      });

      return NextResponse.json({ success: true, message: `Canal ${channelId} conectado` });
    }

    if (action === "disconnect") {
      const configKey = `channels_${session.tenantId}`;
      const existing = await prisma.systemConfig.findFirst({ where: { key: configKey } });
      if (existing) {
        const data = JSON.parse(existing.value);
        const channelIdx = data.channels.findIndex((c: any) => c.id === channelId);
        if (channelIdx >= 0) {
          data.channels[channelIdx].status = "disconnected";
          data.channels[channelIdx].lastSync = null;
        }
        await prisma.systemConfig.update({ where: { key: configKey }, data: { value: JSON.stringify(data) } });
      }
      return NextResponse.json({ success: true, message: `Canal ${channelId} desconectado` });
    }

    if (action === "sync") {
      // Simulate sync — in production would push rates/availability to OTA APIs
      return NextResponse.json({ success: true, message: "Sincronização realizada", synced: new Date().toISOString() });
    }

    return NextResponse.json({ success: false, error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Channels POST error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
