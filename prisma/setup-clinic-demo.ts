import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Setup Hachi Clinic Demo tenant with admin user.
 * Phase 4 — Second vertical (Clinic).
 */
async function main() {
  console.log("🏥 Setting up Hachi Clinic Demo tenant...\n");

  // 1. Create clinic demo tenant (upsert for idempotency)
  const tenant = await prisma.tenant.upsert({
    where: { slug: "clinic-demo" },
    update: {},
    create: {
      name: "Hachi Clinic Demo",
      slug: "clinic-demo",
      vertical: "clinic",
      plan: "professional",
      active: true,
      config: {
        features: {
          financeiro: true,
          agenda: true,
          documentos: true,
          estoque: true,
          comunicacao: true,
          relatorios: true,
          configuracoes: true,
          prontuario: true,
          portalFamilia: false,
          quartos: false,
          prescricoes: true,
          crm: true,
          pdv: false,
          delivery: false,
          reservas: false,
        },
        branding: {
          name: "Hachi Clinic Demo",
          primaryColor: "#2563eb",
          logo: "/images/hachi-logo.png",
        },
      },
    },
  });

  console.log(`  ✓ Tenant criado: ${tenant.name} (${tenant.slug})`);
  console.log(`    ID: ${tenant.id}`);
  console.log(`    Vertical: ${tenant.vertical}`);
  console.log(`    Plano: ${tenant.plan}`);

  // 2. Create demo admin user
  const hashedPassword = await bcrypt.hash("Clinic@2026", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@clinic-demo.com" },
    update: { tenantId: tenant.id },
    create: {
      email: "admin@clinic-demo.com",
      password: hashedPassword,
      name: "Admin Clinic Demo",
      role: "ADMIN",
      tenantId: tenant.id,
      active: true,
    },
  });

  console.log(`  ✓ Usuário admin criado: ${user.email}`);
  console.log(`    Role: ${user.role}`);
  console.log(`    Tenant: ${tenant.slug}`);

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Hachi Clinic Demo setup completo!");
  console.log("   Login: admin@clinic-demo.com / Clinic@2026");
  console.log("   Vertical: clinic");
  console.log("   Features: prontuário, agenda, CRM, financeiro, etc.");
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
