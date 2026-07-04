import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding production database...");

  // ─── Remove test patients ────────────────────────────────
  console.log("  🗑️  Removing test patients...");
  const testCpfs = ["12345678900", "23456789011", "34567890122"];
  const testPatients = await prisma.paciente.findMany({
    where: { cpf: { in: testCpfs } },
    select: { id: true },
  });
  const testIds = testPatients.map((p) => p.id);

  if (testIds.length > 0) {
    // Delete dependent records first
    await prisma.responsavel.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.evolucao.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.prescricao.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.agendamento.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.movimentacaoFinanceira.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.documento.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.comunicacao.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.familyToken.deleteMany({ where: { pacienteId: { in: testIds } } });
    await prisma.paciente.deleteMany({ where: { id: { in: testIds } } });
    console.log(`  ✓ ${testIds.length} pacientes de teste removidos`);
  } else {
    console.log("  ✓ Nenhum paciente de teste encontrado");
  }

  // ─── Users (keep existing, add if missing) ───────────────
  const adminPassword = await bcrypt.hash("Admin@2026", 12);
  const genericPassword = await bcrypt.hash("Equipe@2026", 12);

  const users = [
    { email: "admin@hachi.com", password: adminPassword, name: "Administrador", role: "ADMIN" as const },
    { email: "marcos@hachi.com", password: genericPassword, name: "Dr. Marcos Vieira", role: "MEDICO" as const, crm: "CRM/SC 12345" },
    { email: "ana@hachi.com", password: genericPassword, name: "Dra. Ana Paula", role: "PSICOLOGO" as const, crp: "CRP/SC 08/54321" },
    { email: "paula@hachi.com", password: genericPassword, name: "Enf. Paula Santos", role: "ENFERMEIRO" as const, coren: "COREN/SC 123456" },
    { email: "ricardo@hachi.com", password: genericPassword, name: "Dr. Ricardo Lima", role: "TERAPEUTA" as const },
    { email: "julia@hachi.com", password: genericPassword, name: "Julia Santos", role: "SECRETARIA" as const },
    { email: "financeiro@hachi.com", password: genericPassword, name: "Carlos Financeiro", role: "FINANCEIRO" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }
  console.log(`  ✓ ${users.length} usuários verificados`);

  // ─── Quartos ─────────────────────────────────────────────
  const quartos = [
    { numero: "Q-101", andar: 1, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-102", andar: 1, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-103", andar: 1, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-104", andar: 1, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-105", andar: 1, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-201", andar: 2, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-202", andar: 2, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-203", andar: 2, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-204", andar: 2, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-205", andar: 2, capacidade: 2, tipo: "Duplo" },
  ];

  for (const q of quartos) {
    await prisma.quarto.upsert({
      where: { numero: q.numero },
      update: {},
      create: q,
    });
  }
  console.log(`  ✓ ${quartos.length} quartos verificados`);

  // ─── Pacientes reais (lista de chamada) ──────────────────
  const pacientes = [
    { nome: "Caio Cézar Kilagawa", dataAdmissao: "2024-09-14" },
    { nome: "Fabricio Waschievice Toral", dataAdmissao: "2025-05-18" },
    { nome: "Marcelo Henrique Baldi", dataAdmissao: "2025-07-15" },
    { nome: "Thiago Ferreira da Cruz", dataAdmissao: "2025-09-19" },
    { nome: "Fernando Farias", dataAdmissao: "2025-09-26" },
    { nome: "Antônio Marco da Silva", dataAdmissao: "2025-10-29" },
    { nome: "Daniel Bento Lopes", dataAdmissao: "2025-11-06" },
    { nome: "Roger Daniel Padilha", dataAdmissao: "2026-01-22" },
    { nome: "Douglas Arrais Coutinho", dataAdmissao: "2026-02-11" },
    { nome: "Nilson Vanderlin", dataAdmissao: "2026-02-18" },
    { nome: "Mateus Amandio de Borba", dataAdmissao: "2026-02-27" },
    { nome: "Felipe Ricardo Wathier da Luz", dataAdmissao: "2026-03-05" },
    { nome: "Marleon Coutinho", dataAdmissao: "2026-04-15" },
    { nome: "Fabio Juvencio Limas", dataAdmissao: "2026-04-15" },
    { nome: "Rafael Frezza", dataAdmissao: "2026-04-18" },
    { nome: "Kaiki de Vasconcelos Barbosa", dataAdmissao: "2026-04-18" },
    { nome: "Lucas Salles Manente", dataAdmissao: "2026-04-20" },
    { nome: "Carlos Eduardo da Silva", dataAdmissao: "2026-04-23" },
    { nome: "Rafael Amadeu Washington Kertesz", dataAdmissao: "2026-05-07" },
    { nome: "Pedro Rubens Fernandes", dataAdmissao: "2026-05-07" },
    { nome: "Matheus Vitor Zardo Wisoski", dataAdmissao: "2026-05-10" },
    { nome: "Marcelo Angelo", dataAdmissao: "2026-05-15" },
    { nome: "Rodrigo Nascimento", dataAdmissao: "2026-05-19" },
    { nome: "Jonathan Silva", dataAdmissao: "2026-05-26" },
    { nome: "Adriano Xavier", dataAdmissao: "2026-05-28" },
    { nome: "Juciel Fernandes", dataAdmissao: "2026-05-30" },
    { nome: "Sun de Souza", dataAdmissao: "2026-06-04" },
    { nome: "Daniel Campos Cascaes", dataAdmissao: "2026-06-05" },
    { nome: "Antonio Alex", dataAdmissao: "2026-06-10" },
    { nome: "Luiggi Cristian Francisco", dataAdmissao: "2026-06-10" },
    { nome: "Alex Junior", dataAdmissao: "2026-06-19" },
    { nome: "Paulo Chagas", dataAdmissao: "2026-06-20" },
    { nome: "Daylon", dataAdmissao: "2026-06-23" },
    { nome: "Maicon Almeirindo", dataAdmissao: "2026-06-28" },
    { nome: "Vitor Guimarães", dataAdmissao: "2026-07-01" },
    { nome: "Alessandro", dataAdmissao: "2026-07-02" },
  ];

  let created = 0;
  let skipped = 0;

  for (const p of pacientes) {
    // Check if patient already exists by name
    const existing = await prisma.paciente.findFirst({
      where: { nome: { equals: p.nome, mode: "insensitive" } },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Generate a placeholder CPF (will be filled by secretaria later)
    const placeholderCpf = `000${String(Date.now()).slice(-8)}${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;

    await prisma.paciente.create({
      data: {
        nome: p.nome,
        cpf: placeholderCpf,
        dataNascimento: new Date("1990-01-01"), // Placeholder — will be updated
        sexo: "M",
        estadoCivil: "SOLTEIRO",
        dataAdmissao: new Date(p.dataAdmissao),
        diasTratamento: 90,
        status: "ATIVO",
      },
    });
    created++;
  }

  console.log(`  ✓ Pacientes: ${created} criados, ${skipped} já existiam`);

  // ─── Sync quarto status ──────────────────────────────────
  const occupiedQuartos = await prisma.paciente.findMany({
    where: { status: "ATIVO", quartoId: { not: null }, deletedAt: null },
    select: { quartoId: true },
  });

  for (const p of occupiedQuartos) {
    if (p.quartoId) {
      await prisma.quarto.update({
        where: { id: p.quartoId },
        data: { status: "OCUPADO" },
      });
    }
  }

  console.log("\n✅ Production seed completed!");
  console.log(`   ${pacientes.length} pacientes na lista de chamada`);
  console.log(`   ${quartos.length} quartos`);
  console.log(`   ${users.length} profissionais`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
