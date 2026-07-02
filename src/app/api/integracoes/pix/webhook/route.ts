import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST: Pix webhook — receives payment confirmations from EFI.
 * This endpoint is PUBLIC (called by EFI servers).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // EFI sends { pix: [{ txid, valor, horario, ... }] }
    const pixEvents = body.pix || [];

    for (const event of pixEvents) {
      const { txid } = event;
      if (!txid) continue;

      // Find and update the financial movement
      await prisma.movimentacaoFinanceira.updateMany({
        where: { pixTxId: txid, status: { not: "PAGO" } },
        data: {
          status: "PAGO",
          dataPagamento: new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pix webhook error:", error);
    return NextResponse.json({ ok: true }); // Always 200 to avoid retries
  }
}
