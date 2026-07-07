import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// BILLING FOUNDATIONS
// ═══════════════════════════════════════════════════════════

export interface BillingPlan {
  id: string;
  name: string;
  price: number; // R$ por mês
  features: string[];
  limits: {
    maxUsers: number;
    maxPatients: number;
  };
}

export const PLANS: Record<string, BillingPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 299,
    features: [
      "Prontuário eletrônico",
      "Agenda básica",
      "Financeiro simplificado",
      "Portal da família",
      "Suporte por email",
    ],
    limits: {
      maxUsers: 5,
      maxPatients: 50,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 599,
    features: [
      "Tudo do Starter",
      "CRM integrado",
      "Relatórios avançados",
      "Integrações (Pix, NF-e, WhatsApp)",
      "Automações",
      "Suporte prioritário",
    ],
    limits: {
      maxUsers: 15,
      maxPatients: 200,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 1499,
    features: [
      "Tudo do Professional",
      "Usuários ilimitados",
      "Pacientes ilimitados",
      "Multi-unidade",
      "API completa",
      "White-label",
      "Gerente de conta dedicado",
      "SLA 99.9%",
    ],
    limits: {
      maxUsers: -1, // ilimitado
      maxPatients: -1, // ilimitado
    },
  },
};

export interface PlanLimitsCheck {
  withinLimits: boolean;
  plan: string;
  currentUsers: number;
  maxUsers: number;
  currentPatients: number;
  maxPatients: number;
}

/**
 * Checks if a tenant is within its plan limits.
 * Returns current usage vs allowed limits.
 */
export async function checkPlanLimits(tenantId: string): Promise<PlanLimitsCheck> {
  // Get tenant's plan
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true },
  });

  const planId = tenant?.plan || "starter";
  const plan = PLANS[planId] || PLANS.starter;

  // Count current users in this tenant
  const currentUsers = await prisma.user.count({
    where: { tenantId, active: true },
  });

  // Count current patients in this tenant
  const currentPatients = await prisma.paciente.count({
    where: { tenantId, deletedAt: null },
  });

  const maxUsers = plan.limits.maxUsers;
  const maxPatients = plan.limits.maxPatients;

  // -1 means unlimited
  const usersOk = maxUsers === -1 || currentUsers <= maxUsers;
  const patientsOk = maxPatients === -1 || currentPatients <= maxPatients;

  return {
    withinLimits: usersOk && patientsOk,
    plan: planId,
    currentUsers,
    maxUsers,
    currentPatients,
    maxPatients,
  };
}
