import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Webhook endpoint for payment gateway callbacks
// This is PUBLIC (no auth required) — called by Stripe/Asaas
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txid, status, gatewayId } = body;

    if (!txid) {
      return NextResponse.json({ error: "txid required" }, { status: 400 });
    }

    // Find the pending subscription by txid
    const configs = await prisma.systemConfig.findMany({
      where: { key: { startsWith: "pending_subscription_" } },
    });

    let targetConfig = null;
    for (const config of configs) {
      try {
        const parsed = JSON.parse(config.value);
        if (parsed.txid === txid) {
          targetConfig = config;
          break;
        }
      } catch { continue; }
    }

    if (!targetConfig) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const subscription = JSON.parse(targetConfig.value);
    const tenantId = subscription.tenantId;

    if (status === "approved" || status === "paid") {
      // Activate the plan
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (tenant) {
        const config = typeof tenant.config === "object" && tenant.config !== null ? tenant.config as Record<string, unknown> : {};
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            plan: subscription.planId,
            active: true,
            config: {
              ...config,
              billing: {
                plan: subscription.planId,
                price: subscription.price,
                activatedAt: new Date().toISOString(),
                gatewayId: gatewayId || null,
                nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
              },
            },
          },
        });

        // Update the tenant to extend billing period
        // Note: trialEndsAt doesn't exist in schema, billing managed via config
      }

      // Mark subscription as paid
      await prisma.systemConfig.update({
        where: { key: targetConfig.key },
        data: {
          value: JSON.stringify({ ...subscription, status: "paid", paidAt: new Date().toISOString() }),
        },
      });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
