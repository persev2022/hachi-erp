import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data for all verticals...\n");

  const tenants = await prisma.tenant.findMany({
    where: { slug: { not: "ct-persev" } },
  });

  if (tenants.length === 0) {
    console.log("  ⚠ No demo tenants found (only ct-persev exists). Run setup-all-verticals first.");
    return;
  }

  for (const tenant of tenants) {
    // Check if tenant already has patients
    const existing = await prisma.paciente.count({ where: { tenantId: tenant.id } });
    if (existing > 0) {
      console.log(`  ⏭ ${tenant.name}: already has ${existing} records`);
      continue;
    }

    // Create 3 demo records per tenant
    const names = getDemoNames(tenant.vertical);
    for (const name of names) {
      const placeholderCpf = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-11);
      await prisma.paciente.create({
        data: {
          nome: name,
          cpf: placeholderCpf,
          dataNascimento: new Date("1990-01-15"),
          sexo: "M",
          estadoCivil: "SOLTEIRO",
          dataAdmissao: new Date(),
          diasTratamento: 90,
          status: "ATIVO",
          tenantId: tenant.id,
        },
      });
    }
    console.log(`  ✓ ${tenant.name}: ${names.length} demo records created`);
  }

  console.log("\n✅ Demo data seeded!");
}

function getDemoNames(vertical: string): string[] {
  switch (vertical) {
    case "recovery":
      return ["Carlos Esperança", "Maria Renascimento", "João Recomeço"];
    case "clinic":
      return ["Maria Silva", "João Santos", "Ana Oliveira"];
    case "senior":
      return ["Dona Maria", "Sr. José", "Dona Ana"];
    case "hotel":
      return ["Carlos Viajante", "Marina Turista", "Pedro Hóspede"];
    case "education":
      return ["Lucas Aluno", "Julia Estudante", "Pedro Escolar"];
    case "vet":
      return ["Rex (Golden)", "Mia (Persa)", "Thor (Labrador)"];
    case "services":
      return ["Empresa ABC", "Consultoria XYZ", "Agência Digital"];
    default:
      return ["Demo User 1", "Demo User 2", "Demo User 3"];
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
