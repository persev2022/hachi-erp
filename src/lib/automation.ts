/**
 * Automation Engine — Workflow Triggers
 *
 * Executes automated actions based on events.
 * Phase 1: Simple trigger → action model stored in SystemConfig per tenant.
 * Phase 2: Visual workflow builder in the frontend.
 *
 * Examples:
 * - "patient.created" → send WhatsApp welcome message
 * - "payment.overdue" → send reminder via BotConversa
 * - "appointment.created" → notify professional
 * - "evolution.unsigned" → alert after 24h
 */

import { emitEvent } from "@/lib/webhooks";
import { createNotification } from "@/lib/notifications";

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string; // event type that activates this rule
  conditions?: Record<string, any>; // optional conditions to check
  action: AutomationAction;
  active: boolean;
}

export interface AutomationAction {
  type: "whatsapp" | "email" | "webhook" | "internal_notification";
  config: Record<string, any>;
}

// Default automation rules for Recovery vertical
export const DEFAULT_RECOVERY_AUTOMATIONS: AutomationRule[] = [
  {
    id: "auto-welcome-msg",
    name: "Mensagem de boas-vindas ao responsável",
    trigger: "patient.created",
    action: {
      type: "whatsapp",
      config: {
        template: "welcome",
        target: "responsavel",
      },
    },
    active: true,
  },
  {
    id: "auto-payment-reminder",
    name: "Lembrete de pagamento 3 dias antes",
    trigger: "payment.upcoming",
    conditions: { daysBeforeDue: 3 },
    action: {
      type: "whatsapp",
      config: {
        template: "payment_reminder",
        target: "responsavel",
      },
    },
    active: true,
  },
  {
    id: "auto-appointment-notify",
    name: "Notificar profissional sobre agendamento",
    trigger: "appointment.created",
    action: {
      type: "internal_notification",
      config: {
        target: "profissional",
        message: "Novo agendamento criado",
      },
    },
    active: true,
  },
  {
    id: "auto-overdue-alert",
    name: "Alerta de inadimplência",
    trigger: "payment.overdue",
    action: {
      type: "whatsapp",
      config: {
        template: "payment_overdue",
        target: "responsavel",
      },
    },
    active: true,
  },
];

/**
 * Process automation rules for an event.
 * For now, logs execution. In Phase 2, executes the actual actions.
 */
export async function processAutomations(
  tenantId: string,
  event: string,
  payload: any,
  rules: AutomationRule[]
): Promise<{ executed: string[]; skipped: string[] }> {
  const executed: string[] = [];
  const skipped: string[] = [];

  for (const rule of rules) {
    if (!rule.active) {
      skipped.push(rule.id);
      continue;
    }

    if (rule.trigger !== event) {
      continue;
    }

    // Check conditions if any
    if (rule.conditions) {
      // Simple condition matching (expandable)
      const conditionsMet = Object.entries(rule.conditions).every(
        ([key, value]) => payload[key] === value
      );
      if (!conditionsMet) {
        skipped.push(rule.id);
        continue;
      }
    }

    // Log execution
    await emitEvent(tenantId, `automation.executed`, {
      ruleId: rule.id,
      ruleName: rule.name,
      trigger: event,
      action: rule.action,
      payload,
    });

    // Create notification for the responsible user
    await createNotification({
      tenantId,
      userId: payload.userId || "system",
      title: `Automação: ${rule.name}`,
      message: `Regra "${rule.name}" executada para ${event}`,
      type: "info",
      link: payload.link || undefined,
    });

    executed.push(rule.id);
  }

  return { executed, skipped };
}
