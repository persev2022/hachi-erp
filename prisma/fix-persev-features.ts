import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing CT Persev feature flags...\n");

  const tenant = await prisma.tenant.findUnique({ where: { slug: "ct-persev" } });
  if (!tenant) {
    console.log("CT Persev not found");
    return;
  }

  const config = (tenant.config as any) || {};

  // Recovery should NOT have PDV, delivery, reservas
  const correctFeatures = {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: true,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: true,
    portalFamilia: true,
    quartos: true,
    prescricoes: true,
    crm: false,
    pdv: false,
    delivery: false,
    reservas: false,
  };

  await prisma.tenant.update({
    where: { slug: "ct-persev" },
    data: {
      config: {
        ...config,
        features: correctFeatures,
      },
    },
  });

  console.log("✓ CT Persev features corrigidas:");
  console.log("  pdv: false, delivery: false, reservas: false, crm: false");
  console.log("  prontuario: true, quartos: true, portalFamilia: true");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
