import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find Cesar by name
  const cesar = await prisma.user.findFirst({
    where: { name: { contains: "esar", mode: "insensitive" } },
  });

  if (!cesar) {
    // List all users
    const users = await prisma.user.findMany({
      select: { name: true, role: true, email: true },
    });
    console.log("Cesar não encontrado. Usuários existentes:");
    for (const u of users) {
      console.log(`  ${u.name} (${u.role}) - ${u.email}`);
    }
    return;
  }

  console.log(`Encontrado: ${cesar.name} (${cesar.role}) - ${cesar.email}`);
  await prisma.user.update({
    where: { id: cesar.id },
    data: { role: "COORDENADOR" },
  });
  console.log("✓ Atualizado para COORDENADOR");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
