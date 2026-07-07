import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Setup default tenant (CT Persev) and link all existing users.
 * This is a non-destructive migration — nothing breaks, just adds data.
 */
async function main() {
  console.log("🏢 Setting up default tenant...\n");

  // 1. Create default tenant (upsert to be idempotent)
  const tenant = await prisma.tenant.upsert({
    where: { slug: "ct-persev" },
    update: {},
    create: {
      name: "CT Persev",
      slug: "ct-persev",
      vertical: "recovery",
      plan: "enterprise",
      active: true,
      config: {
        features: {
          financeiro: true,
          agenda: true,
          documentos: true,
          estoque: true,
          comunicacao: true,
          relatorios: true,
          prontuario: true,
          portalFamilia: true,
          quartos: true,
          prescricoes: true,
          crm: false,
          pdv: false,
          delivery: false,
          reservas: false,
        },
        branding: {
          name: "CT Persev",
          primaryColor: "#0d9488",
          logo: "/images/hachi-logo.png",
        },
      },
    },
  });

  console.log(`  ✓ Tenant criado: ${tenant.name} (${tenant.slug})`);
  console.log(`    ID: ${tenant.id}`);
  console.log(`    Vertical: ${tenant.vertical}`);
  console.log(`    Plano: ${tenant.plan}`);

  // 2. Link all existing users to this tenant (only those without tenantId)
  const result = await prisma.user.updateMany({
    where: { tenantId: null },
    data: { tenantId: tenant.id },
  });

  console.log(`  ✓ ${result.count} usuários vinculados ao tenant`);

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Tenant setup completo!");
  console.log("   O sistema continua funcionando normalmente.");
  console.log("   Multi-tenant está preparado mas não ativo.");
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
