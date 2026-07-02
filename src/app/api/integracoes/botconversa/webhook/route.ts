import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook endpoint for BotConversa status updates.
 * This endpoint is PUBLIC (no auth) — called by BotConversa servers.
 * Security: validate via shared secret in headers or body.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // BotConversa sends status updates with message_id and status
    const { message_id, status, phone } = body;

    if (!message_id && !phone) {
      return NextResponse.json({ ok: true }); // ack but nothing to do
    }

    // Map BotConversa status to our status
    const statusMap: Record<string, string> = {
      sent: "ENVIADA",
      delivered: "ENTREGUE",
      read: "LIDA",
      failed: "FALHA",
    };

    const ourStatus = statusMap[status] || "ENVIADA";

    // Update communication record if we have botconversaId
    if (message_id) {
      await prisma.comunicacao.updateMany({
        where: { botconversaId: message_id },
        data: { status: ourStatus as any },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("BotConversa webhook error:", error);
    return NextResponse.json({ ok: true }); // Always 200 to avoid retries
  }
}
