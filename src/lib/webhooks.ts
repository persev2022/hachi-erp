import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

/**
 * Webhook Events System
 *
 * Foundation for external webhook delivery.
 * Phase 1: Events are logged to AuditLog with action="WEBHOOK_EVENT".
 * Phase 2: Will deliver to registered webhook endpoints per tenant.
 */

export interface WebhookEvent {
  id: string;
  tenantId: string;
  event: string;
  payload: any;
  createdAt: Date;
}

// Supported event types
export type WebhookEventType =
  | "patient.created"
  | "patient.updated"
  | "payment.received"
  | "appointment.created"
  | "document.generated";

/**
 * Emit a webhook event.
 * For now, stores in AuditLog. Later will dispatch to registered endpoints.
 */
export async function emitEvent(
  tenantId: string,
  event: WebhookEventType | string,
  payload: any,
  userId?: string
): Promise<WebhookEvent> {
  const webhookEvent: WebhookEvent = {
    id: randomUUID(),
    tenantId,
    event,
    payload,
    createdAt: new Date(),
  };

  // Store in AuditLog as the current delivery mechanism
  await prisma.auditLog.create({
    data: {
      userId: userId || "system",
      action: "WEBHOOK_EVENT",
      entity: "webhook",
      entityId: webhookEvent.id,
      details: {
        tenantId,
        event,
        payload,
      } as any,
    },
  });

  return webhookEvent;
}
