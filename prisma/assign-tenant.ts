import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Assigns the default tenant (CT Persev) to all existing records
 * that don't have a tenantId yet. Non-destructive, idempotent.
 */
async function main() {
  console.log("🔗 Vinculando registros ao tenant padrão...\n");

  // Get default tenant
  const tenant = await prisma.tenant.findUnique({ where: { slug: "ct-persev" } });
  if (!tenant) {
    console.error("❌ Tenant ct-persev não encontrado. Execute setup-tenant.ts primeiro.");
    process.exit(1);
  }

  const tenantId = tenant.id;
  console.log(`  Tenant: ${tenant.name} (${tenantId})\n`);

  // Update all tables with tenantId = null
  const results = await Promise.all([
    prisma.paciente.updateMany({ where: { tenantId: null }, data: { tenantId } }),
    prisma.quarto.updateMany({ where: { tenantId: null }, data: { tenantId } }),
    prisma.movimentacaoFinanceira.updateMany({ where: { tenantId: null }, data: { tenantId } }),
    prisma.itemEstoque.updateMany({ where: { tenantId: null }, data: { tenantId } }),
    prisma.comunicacao.updateMany({ where: { tenantId: null }, data: { tenantId } }),
  ]);

  const labels = ["Pacientes", "Quartos", "Movimentações", "Estoque", "Comunicações"];
  results.forEach((r, i) => {
    console.log(`  ✓ ${labels[i]}: ${r.count} registros vinculados`);
  });

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Todos os registros vinculados ao tenant!");
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => { console.error("❌ Erro:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
