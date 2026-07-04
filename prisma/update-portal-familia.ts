import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🏠 Atualizando Portal da Família...\n");

  // 1. List existing tokens
  const existingTokens = await prisma.familyToken.findMany({
    include: { paciente: { select: { id: true, nome: true } } },
  });
  console.log(`  Tokens existentes: ${existingTokens.length}`);
  for (const t of existingTokens) {
    console.log(`    ${t.paciente.nome} → ${t.familiarNome} (active: ${t.active})`);
  }

  // 2. Find patients with responsáveis but no token
  const pacientes = await prisma.paciente.findMany({
    where: { status: "ATIVO", deletedAt: null },
    include: {
      responsaveis: { where: { isFinanceiro: true }, take: 1 },
    },
    orderBy: { nome: "asc" },
  });

  const existingPacienteIds = new Set(existingTokens.map((t) => t.pacienteId));

  let created = 0;
  console.log("\n  Criando tokens para familiares...");

  for (const p of pacientes) {
    if (existingPacienteIds.has(p.id)) continue;
    if (p.responsaveis.length === 0) continue;

    const resp = p.responsaveis[0];
    const token = randomBytes(16).toString("hex");

    await prisma.familyToken.create({
      data: {
        token,
        pacienteId: p.id,
        familiarNome: resp.nome,
        familiarPhone: resp.telefone || null,
      },
    });

    console.log(`    ✓ ${p.nome} → ${resp.nome} (${resp.parentesco}) | Token: ${token.slice(0, 8)}...`);
    created++;
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ Portal da Família atualizado!`);
  console.log(`   ${existingTokens.length} tokens já existiam`);
  console.log(`   ${created} novos tokens criados`);
  console.log(`   Total: ${existingTokens.length + created} famílias com acesso`);
  console.log(`═══════════════════════════════════════`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
