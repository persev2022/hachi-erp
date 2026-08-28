/**
 * Removes manual "Mensalidade agosto de 2026" entries that are NOT backed by
 * the official bank statement. The bank extratos are the source of truth for
 * money that actually moved. These 5 manual entries inflate August revenue by R$17.480.
 *
 * DRY-RUN by default. Use --apply to delete.
 * Run: npx tsx prisma/limpar-lancamentos-manuais.ts [--apply]
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { slug: "ct-persev" } });
  if (!tenant) return;

  // Find manual entries whose description is a generic "Mensalidade ... de 2026"
  // (these were created via the manual payment form, NOT from bank statement import)
  const manuais = await prisma.movimentacaoFinanceira.findMany({
    where: {
      tenantId: tenant.id,
      descricao: { contains: "Mensalidade", mode: "insensitive" },
      NOT: { descricao: { contains: "PIX", mode: "insensitive" } },
    },
    include: { paciente: { select: { nome: true } } },
  });

  console.log("═══ LANÇAMENTOS MANUAIS (não vindos do extrato) ═══\n");
  let total = 0;
  for (const m of manuais) {
    console.log(`  ${m.dataVencimento.toISOString().slice(0,10)} R$${m.valor.toFixed(2)} | ${m.paciente?.nome || "sem paciente"} | "${m.descricao}"`);
    total += m.valor;
  }
  console.log(`\n  Total: ${manuais.length} lançamentos, R$ ${total.toFixed(2)}`);

  if (APPLY) {
    const ids = manuais.map(m => m.id);
    const del = await prisma.movimentacaoFinanceira.deleteMany({ where: { id: { in: ids } } });
    console.log(`\n✅ ${del.count} lançamentos manuais removidos. Agora o banco reflete exatamente os extratos.`);
  } else {
    console.log(`\n🔍 DRY-RUN. Rode com --apply para remover.`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
