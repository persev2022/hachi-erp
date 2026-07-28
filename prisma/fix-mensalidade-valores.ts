/**
 * Script para corrigir valores de mensalidade que foram salvos incorretamente.
 * 
 * Bug: o input type="number" com locale PT-BR interpretava "2.500" (separador de milhar)
 * como 2.5 (decimal americano). Isso fazia R$ 2.500 virar R$ 2,50 no banco.
 * 
 * Este script encontra todos os pacientes ativos com mensalidadeValor < 10 (claramente errado)
 * e multiplica por 1000 para restaurar o valor correto.
 * 
 * Execução: npx tsx prisma/fix-mensalidade-valores.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Corrigindo valores de mensalidade incorretos...\n");

  // Find all patients with suspiciously low mensalidade values (between 0.01 and 10)
  const pacientes = await prisma.paciente.findMany({
    where: {
      mensalidadeValor: { gt: 0, lt: 10 },
      deletedAt: null,
    },
    select: {
      id: true,
      nome: true,
      mensalidadeValor: true,
      status: true,
    },
  });

  if (pacientes.length === 0) {
    console.log("✅ Nenhum paciente com valor de mensalidade incorreto encontrado.");
    console.log("   Todos os valores parecem corretos (>= R$ 10,00).");
    return;
  }

  console.log(`📋 Encontrados ${pacientes.length} paciente(s) com valores suspeitos:\n`);

  for (const p of pacientes) {
    const valorAtual = p.mensalidadeValor!;
    const valorCorrigido = valorAtual * 1000;

    console.log(`  ${p.nome} (${p.status})`);
    console.log(`    Valor atual:    R$ ${valorAtual.toFixed(2).replace(".", ",")}`);
    console.log(`    Valor corrigido: R$ ${valorCorrigido.toFixed(2).replace(".", ",")}`);

    await prisma.paciente.update({
      where: { id: p.id },
      data: { mensalidadeValor: valorCorrigido },
    });

    console.log(`    ✓ Corrigido!\n`);
  }

  console.log(`\n✅ ${pacientes.length} paciente(s) corrigido(s) com sucesso.`);
  console.log("   Os valores de Pix agora serão gerados corretamente.");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
