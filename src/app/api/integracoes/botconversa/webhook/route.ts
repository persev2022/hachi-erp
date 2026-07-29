import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook endpoint for BotConversa.
 * Handles:
 * 1. Incoming messages from contacts (forwarded via Integration Block in flows)
 * 2. Message status updates (sent/delivered/read/failed)
 *
 * This endpoint is PUBLIC (no auth) — called by BotConversa servers.
 * Accepts multiple field name variations to be resilient to different configs.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log full payload for debugging
    console.log("[BotConversa Webhook]", JSON.stringify(body).slice(0, 800));

    // ─── TRY TO EXTRACT MESSAGE DATA ─────────────────────
    // BotConversa Integration Block can send fields with various names.
    // We try all common variations.
    const phone = String(
      body.phone || body.telefone || body.numero || body.number || body.cel || body.whatsapp || ""
    ).replace(/\D/g, "");

    const message = String(
      body.message || body.mensagem || body.last_input || body.texto ||
      body.text || body.value || body.msg || body.input || ""
    ).trim();

    const messageType = body.type || body.tipo || "text";

    // ─── SAVE INCOMING MESSAGE ────────────────────────────
    if (phone.length >= 10 && message.length > 0) {
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
          select: { tenantId: true },
        });
        tenantId = paciente?.tenantId || null;
      }

      // Save incoming message
      await prisma.comunicacao.create({
        data: {
          destinatario: phone,
          canal: "WHATSAPP",
          assunto: "RECEBIDA",
          mensagem: messageType === "text" ? message : `[${messageType}] ${message}`,
          status: "LIDA",
          botconversaId: body.message_id || body.id || null,
          tenantId,
        },
      });

      return NextResponse.json({ ok: true, saved: true });
    }

    // ─── STATUS UPDATE ────────────────────────────────────
    const messageId = body.message_id || body.messageId;
    const status = body.status;

    if (messageId && status) {
      const statusMap: Record<string, string> = {
        sent: "ENVIADA",
        delivered: "ENTREGUE",
        read: "LIDA",
        failed: "FALHA",
      };

      const ourStatus = statusMap[status] || "ENVIADA";

      await prisma.comunicacao.updateMany({
        where: { botconversaId: messageId },
        data: { status: ourStatus as any },
      });

      return NextResponse.json({ ok: true, statusUpdated: true });
    }

    // If we got data but couldn't parse it, log for debugging
    console.log("[BotConversa Webhook] Unhandled payload — phone:", phone, "message:", message.slice(0, 50));
    return NextResponse.json({ ok: true, unhandled: true });
  } catch (error) {
    console.error("BotConversa webhook error:", error);
    return NextResponse.json({ ok: true }); // Always 200 to avoid retries
  }
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok", service: "hachi-erp-botconversa-webhook" });
}
