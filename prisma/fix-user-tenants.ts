import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing users without tenantId...\n");

  // Get CT Persev tenant
  const persev = await prisma.tenant.findUnique({ where: { slug: "ct-persev" } });
  if (!persev) {
    console.error("CT Persev tenant not found!");
    return;
  }
  console.log(`CT Persev tenant: ${persev.id}`);

  // Find all users without tenantId
  const orphanUsers = await prisma.user.findMany({
    where: { tenantId: null },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log(`\nOrphan users (no tenantId): ${orphanUsers.length}`);
  for (const u of orphanUsers) {
    console.log(`  - ${u.email} (${u.role})`);
  }

  // Assign all orphan users to CT Persev (since that's the main tenant)
  if (orphanUsers.length > 0) {
    const result = await prisma.user.updateMany({
      where: { tenantId: null },
      data: { tenantId: persev.id },
    });
    console.log(`\n✓ Updated ${result.count} users with tenantId: ${persev.id}`);
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
