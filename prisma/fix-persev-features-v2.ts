import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const persev = await prisma.tenant.findUnique({ where: { slug: "ct-persev" } });
  if (!persev) { console.log("Not found"); return; }

  const config = typeof persev.config === "object" && persev.config !== null ? persev.config as Record<string, unknown> : {};

  const newFeatures = {
    financeiro: true, agenda: true, documentos: true, estoque: true,
    comunicacao: true, relatorios: true, configuracoes: true,
    prontuario: true, portalFamilia: true, quartos: true, prescricoes: true,
    crm: false, pdv: false, delivery: false, reservas: false,
    captadores: true, formularios: true, ferramentas: false,
  };

  await prisma.tenant.update({
    where: { slug: "ct-persev" },
    data: { config: { ...config, features: newFeatures } },
  });

  console.log("✓ CT Persev features updated");
  console.log("  captadores: true, formularios: true");
  console.log("  crm: false, ferramentas: false, pdv: false, delivery: false, reservas: false");
}

main().catch(console.error).finally(() => prisma.$disconnect());
