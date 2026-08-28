/**
 * Recategorizes RECEITA entries that are marked MENSALIDADE but are actually
 * other revenue types (SUS/FMS transfers, financial redemptions, cobrança liquidation,
 * B2B revenue). This makes the DRE and category analysis accurate.
 *
 * Categories used (existing enum): MENSALIDADE, OUTRO
 * We reclassify non-patient revenue as OUTRO.
 *
 * DRY-RUN by default. Use --apply.
 * Run: npx tsx prisma/recategorizar-receitas.ts [--apply]
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// Patterns that indicate NON-mensalidade revenue
function isNonMensalidade(desc: string): boolean {
  const d = desc.toUpperCase();
  return (
    d.includes("RESG.APLIC") || d.includes("RESGATE") || d.includes("RENDIMENTO") ||
    d.includes("APLIC.FIN") ||
    d.includes("CUSTEIO SUS") || d.includes("FMS HOSPITAL") || d.includes("FMS RIO") ||
    d.includes("FMS CUSTEIO") || d.includes("PMNT FMS") || d.includes("FUNDO MUNICIPAL") ||
    d.includes("PREFEITURA") ||
    d.includes("RESTAURANTE DIVIN") || d.includes("SUGAR DESENTUP") ||
    d.includes("PREVENFOR") || d.includes("FIORITEC") ||
    d.includes("ESTORNO") || d.includes("DEVOLUC") ||
    d.includes("INTEGR.CAPITAL") ||
    d.includes("REEMBOLSO")
    // NOTE: intentionally NOT reclassifying generic PIX from individuals
    // (e.g. "Mateus de Jesus", "Marilene") — those could be legit patient payments.
    // Only clearly institutional/financial revenue is reclassified.
  );
}

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { slug: "ct-persev" } });
  if (!tenant) return;

  const receitas = await prisma.movimentacaoFinanceira.findMany({
    where: { tenantId: tenant.id, tipo: "RECEITA", categoria: "MENSALIDADE" },
    select: { id: true, descricao: true, valor: true, dataVencimento: true },
  });

  const toReclassify = receitas.filter(r => isNonMensalidade(r.descricao));

  console.log("═══ RECEITAS A RECATEGORIZAR (MENSALIDADE → OUTRO) ═══\n");
  let total = 0;
  toReclassify.forEach(r => {
    console.log(`  ${r.dataVencimento.toISOString().slice(0,10)} R$${r.valor.toFixed(2)} | ${r.descricao.slice(0,55)}`);
    total += r.valor;
  });
  console.log(`\n  Total: ${toReclassify.length} receitas, R$ ${total.toFixed(2)}`);
  console.log(`  Restantes como MENSALIDADE: ${receitas.length - toReclassify.length}`);

  if (APPLY) {
    const ids = toReclassify.map(r => r.id);
    const upd = await prisma.movimentacaoFinanceira.updateMany({
      where: { id: { in: ids } },
      data: { categoria: "OUTRO" },
    });
    console.log(`\n✅ ${upd.count} receitas recategorizadas para OUTRO.`);
  } else {
    console.log(`\n🔍 DRY-RUN. Rode com --apply para aplicar.`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
