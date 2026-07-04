import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🏥 Configurando quartos e ocupantes...\n");

  // ─── Definição dos quartos reais ─────────────────────────
  const quartosConfig = [
    { numero: "Q-01", andar: 1, capacidade: 6, tipo: "Compartilhado", ocupantes: ["Antonio Alex", "Carlos Eduardo da Silva", "Daniel Campos Cascaes", "Rodrigo Nascimento", "Marleon Coutinho"] },
    { numero: "Q-02", andar: 1, capacidade: 6, tipo: "Compartilhado", ocupantes: ["Fernando Farias", "Marcelo Henrique Baldi", "Vitor Guimarães", "Kaiki de Vasconcelos Barbosa"] },
    { numero: "Q-03", andar: 1, capacidade: 6, tipo: "Compartilhado", ocupantes: ["Pedro Rubens Fernandes", "Douglas Arrais Coutinho", "Matheus Vitor Zardo Wisoski", "Juciel Fernandes", "Jonathan Silva"] },
    { numero: "Q-04", andar: 1, capacidade: 6, tipo: "Compartilhado", ocupantes: ["Felipe Ricardo Wathier da Luz", "Luiggi Cristian Francisco", "Adriano Xavier"] },
    { numero: "Q-05", andar: 1, capacidade: 6, tipo: "Compartilhado", ocupantes: ["Antonio Alex", "Sun de Souza", "Caio Cézar Kilagawa", "Paulo Chagas", "Alex Junior"] },
    { numero: "Q-06", andar: 2, capacidade: 6, tipo: "Compartilhado", ocupantes: ["Alessandro", "Fabricio Waschievice Toral", "Mateus Amandio de Borba", "Daniel Bento Lopes"] },
    { numero: "Q-07", andar: 2, capacidade: 6, tipo: "Compartilhado", ocupantes: ["Nilson Vanderlin", "Marcelo Angelo", "Rafael Amadeu Washington Kertesz", "Roger Daniel Padilha", "Lucas Salles Manente", "Thiago Ferreira da Cruz"] },
    { numero: "Q-08", andar: 2, capacidade: 2, tipo: "Duplo", ocupantes: ["Daylon"] },
    { numero: "Q-09", andar: 2, capacidade: 4, tipo: "Duplo", ocupantes: [] },
    { numero: "Q-10", andar: 2, capacidade: 1, tipo: "Individual", ocupantes: ["Fabio Juvencio Limas"] },
    { numero: "Q-11", andar: 2, capacidade: 1, tipo: "Individual", ocupantes: ["Maicon Almeirindo"] },
  ];

  // ─── Remove quartos antigos de teste ─────────────────────
  console.log("  Removendo quartos antigos...");
  // Desvincula pacientes dos quartos antigos
  await prisma.paciente.updateMany({
    where: { quartoId: { not: null } },
    data: { quartoId: null },
  });
  // Delete all old quartos
  await prisma.quarto.deleteMany({});

  // ─── Criar quartos novos ─────────────────────────────────
  for (const q of quartosConfig) {
    const quarto = await prisma.quarto.create({
      data: {
        numero: q.numero,
        andar: q.andar,
        capacidade: q.capacidade,
        tipo: q.tipo,
        status: q.ocupantes.length > 0 ? "OCUPADO" : "DISPONIVEL",
      },
    });

    // Vincular ocupantes
    for (const nomeOcupante of q.ocupantes) {
      const paciente = await prisma.paciente.findFirst({
        where: { nome: { contains: nomeOcupante, mode: "insensitive" }, deletedAt: null },
      });

      if (paciente) {
        await prisma.paciente.update({
          where: { id: paciente.id },
          data: { quartoId: quarto.id },
        });
        console.log(`    ✓ ${nomeOcupante} → ${q.numero}`);
      } else {
        console.log(`    ⚠️ ${nomeOcupante} não encontrado no banco`);
      }
    }
  }

  // Fix Q-05: "Antonio Alex" already in Q-01, so Q-05 should just have Sun, Caio, Paulo, Alex Junior
  // The duplicate will be handled by the DB (last update wins)
  // Let's fix by re-checking Q-05 without Antonio Alex
  const q05 = await prisma.quarto.findUnique({ where: { numero: "Q-05" } });
  if (q05) {
    // Antonio Alex should be in Q-01 per the list header
    const antonioAlex = await prisma.paciente.findFirst({
      where: { nome: { contains: "Antonio Alex", mode: "insensitive" } },
    });
    if (antonioAlex) {
      const q01 = await prisma.quarto.findUnique({ where: { numero: "Q-01" } });
      if (q01) {
        await prisma.paciente.update({
          where: { id: antonioAlex.id },
          data: { quartoId: q01.id },
        });
      }
    }
  }

  console.log("\n✅ Quartos configurados!");
  console.log(`   ${quartosConfig.length} quartos criados`);
  console.log(`   ${quartosConfig.reduce((s, q) => s + q.ocupantes.length, 0)} vinculações processadas`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
