import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Plans configuration
const PLANS = {
  starter: {
    name: "Starter",
    price: 197,
    priceId: "plan_starter",
    features: ["5 usuários", "1 vertical", "Suporte email"],
  },
  professional: {
    name: "Professional",
    price: 497,
    priceId: "plan_professional",
    features: ["20 usuários", "3 verticais", "Suporte prioritário", "API access"],
  },
  enterprise: {
    name: "Enterprise",
    price: 997,
    priceId: "plan_enterprise",
    features: ["Ilimitado", "Todas verticais", "Suporte 24/7", "White-label", "SLA 99.9%"],
  },
};

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    plans: PLANS,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Apenas administradores podem alterar o plano" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { planId, paymentMethod } = body;

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ success: false, error: "Plano inválido" }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    // Generate Pix payment data (simulated gateway)
    // In production, integrate with Stripe or Asaas here
    const pixPayload = {
      txid: `hachi_${session.tenantId}_${Date.now()}`,
      valor: plan.price.toFixed(2),
      chave: "pagamentos@hachi.com.br",
      descricao: `Hachi Platform - ${plan.name}`,
    };

    // Generate payment link (simulate)
    const paymentLink = paymentMethod === "pix"
      ? `pix://pay?txid=${pixPayload.txid}&valor=${pixPayload.valor}`
      : `https://checkout.hachi.com.br/${pixPayload.txid}`;

    // Store pending subscription
    if (session.tenantId) {
      const subKey = `pending_subscription_${session.tenantId}`;
      await prisma.systemConfig.upsert({
        where: { key: subKey },
        create: {
          key: subKey,
          value: JSON.stringify({
            planId,
            price: plan.price,
            txid: pixPayload.txid,
            tenantId: session.tenantId,
            createdAt: new Date().toISOString(),
            status: "pending",
          }),
        },
        update: {
          value: JSON.stringify({
            planId,
            price: plan.price,
            txid: pixPayload.txid,
            tenantId: session.tenantId,
            createdAt: new Date().toISOString(),
            status: "pending",
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentLink,
        pix: paymentMethod === "pix" ? pixPayload : null,
        plan: plan.name,
        price: plan.price,
        txid: pixPayload.txid,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: "Erro ao processar checkout" }, { status: 500 });
  }
}
