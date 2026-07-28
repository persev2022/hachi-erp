import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook endpoint for BotConversa.
 * Handles:
 * 1. Message status updates (sent/delivered/read/failed)
 * 2. Incoming messages from contacts (message received)
 * 
 * This endpoint is PUBLIC (no auth) — called by BotConversa servers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log webhook for debugging (remove in production)
    console.log("[BotConversa Webhook]", JSON.stringify(body).slice(0, 500));

    // ─── INCOMING MESSAGE ─────────────────────────────────
    // BotConversa sends incoming messages with: phone, message, type, subscriber_id
    if (body.message && body.phone) {
      const phone = (body.phone || "").replace(/\D/g, "");
      const message = body.message || body.text || body.value || "";
      const messageType = body.type || "text"; // text, image, audio, video, document
      const subscriberId = body.subscriber_id || body.subscriberId || null;
      const subscriberName = body.subscriber_name || body.first_name || "";

      if (phone && message) {
        // Find tenant by looking at existing communications with this phone
        let tenantId: string | null = null;
        const existingComm = await prisma.comunicacao.findFirst({
          where: { destinatario: phone },
          select: { tenantId: true },
          orderBy: { createdAt: "desc" },
        });
        tenantId = existingComm?.tenantId || null;

        // If no existing comm, try to find via paciente/responsavel phone
        if (!tenantId) {
          const paciente = await prisma.paciente.findFirst({
            where: {
              OR: [
                { telefone: { contains: phone.slice(-8) } },
                { responsaveis: { some: { telefone: { contains: phone.slice(-8) } } } },
              ],
              deletedAt: null,
            },
            select: { tenantId: true, id: true },
          });
          tenantId = paciente?.tenantId || null;
        }

        // Save incoming message
        await prisma.comunicacao.create({
          data: {
            destinatario: phone,
            canal: "WHATSAPP",
            assunto: "RECEBIDA", // Use assunto field to mark direction
            mensagem: messageType === "text" ? message : `[${messageType}] ${message}`,
            status: "LIDA",
            botconversaId: body.message_id || null,
            tenantId,
          },
        });
      }

      return NextResponse.json({ ok: true });
    }

    // ─── STATUS UPDATE ────────────────────────────────────
    const { message_id, status } = body;

    if (message_id && status) {
      // Map BotConversa status to our status
      const statusMap: Record<string, string> = {
        sent: "ENVIADA",
        delivered: "ENTREGUE",
        read: "LIDA",
        failed: "FALHA",
      };

      const ourStatus = statusMap[status] || "ENVIADA";

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

// Also handle GET for webhook verification (some platforms send GET to verify)
export async function GET() {
  return NextResponse.json({ status: "ok", service: "hachi-erp-botconversa-webhook" });
}
