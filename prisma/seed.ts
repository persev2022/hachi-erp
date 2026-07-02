import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@2026", 12);
  const medicoPassword = await bcrypt.hash("Medico@2026", 12);
  const secretariaPassword = await bcrypt.hash("Julia@2026", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hachi.com" },
    update: {},
    create: {
      email: "admin@hachi.com",
      password: adminPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  const medico = await prisma.user.upsert({
    where: { email: "marcos@hachi.com" },
    update: {},
    create: {
      email: "marcos@hachi.com",
      password: medicoPassword,
      name: "Dr. Marcos Vieira",
      role: "MEDICO",
      crm: "CRM/SC 12345",
    },
  });
  console.log(`  ✓ Médico: ${medico.email}`);

  const secretaria = await prisma.user.upsert({
    where: { email: "julia@hachi.com" },
    update: {},
    create: {
      email: "julia@hachi.com",
      password: secretariaPassword,
      name: "Julia Santos",
      role: "SECRETARIA",
    },
  });
  console.log(`  ✓ Secretária: ${secretaria.email}`);

  // ─── Quartos ─────────────────────────────────────────────
  const quartos = [
    { numero: "Q-101", andar: 1, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-102", andar: 1, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-103", andar: 1, capacidade: 1, tipo: "Individual" },
    { numero: "Q-201", andar: 2, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-202", andar: 2, capacidade: 2, tipo: "Duplo" },
    { numero: "Q-203", andar: 2, capacidade: 1, tipo: "Individual" },
  ];

  for (const quarto of quartos) {
    await prisma.quarto.upsert({
      where: { numero: quarto.numero },
      update: {},
      create: quarto,
    });
  }
  console.log(`  ✓ ${quartos.length} quartos criados`);

  // ─── Pacientes ───────────────────────────────────────────
  const q101 = await prisma.quarto.findUnique({ where: { numero: "Q-101" } });
  const q102 = await prisma.quarto.findUnique({ where: { numero: "Q-102" } });
  const q201 = await prisma.quarto.findUnique({ where: { numero: "Q-201" } });

  const pacientesData = [
    {
      nome: "Carlos Eduardo Silva",
      cpf: "12345678900",
      dataNascimento: new Date("1988-03-15"),
      sexo: "Masculino",
      estadoCivil: "SOLTEIRO" as const,
      profissao: "Eletricista",
      telefone: "(48) 99999-0001",
      substanciaPrincipal: "Álcool",
      tempoUso: "8 anos",
      internacoesPrevias: 1,
      dataAdmissao: new Date("2025-01-10"),
      diasTratamento: 90,
      quartoId: q101?.id,
      matriculaValor: 3500,
      mensalidadeValor: 4500,
      diaVencimento: 5,
      responsavel: {
        nome: "Maria da Silva",
        cpf: "98765432100",
        parentesco: "Mãe",
        telefone: "(48) 99988-0001",
        email: "maria.silva@email.com",
        isFinanceiro: true,
      },
    },
    {
      nome: "Marcos Antônio Oliveira",
      cpf: "23456789011",
      dataNascimento: new Date("1992-07-22"),
      sexo: "Masculino",
      estadoCivil: "CASADO" as const,
      profissao: "Pedreiro",
      telefone: "(48) 99999-0002",
      substanciaPrincipal: "Cocaína/Crack",
      tempoUso: "5 anos",
      internacoesPrevias: 2,
      dataAdmissao: new Date("2025-02-15"),
      diasTratamento: 120,
      quartoId: q102?.id,
      matriculaValor: 3500,
      mensalidadeValor: 4500,
      diaVencimento: 20,
      responsavel: {
        nome: "Ana Paula Oliveira",
        cpf: "87654321099",
        parentesco: "Esposa",
        telefone: "(48) 99988-0002",
        email: "ana.oliveira@email.com",
        isFinanceiro: true,
      },
    },
    {
      nome: "Rafael Souza Lima",
      cpf: "34567890122",
      dataNascimento: new Date("1985-11-08"),
      sexo: "Masculino",
      estadoCivil: "DIVORCIADO" as const,
      profissao: "Motorista",
      telefone: "(48) 99999-0003",
      substanciaPrincipal: "Múltiplas substâncias",
      tempoUso: "12 anos",
      internacoesPrevias: 3,
      dataAdmissao: new Date("2025-03-22"),
      diasTratamento: 90,
      quartoId: q201?.id,
      matriculaValor: 3500,
      mensalidadeValor: 4500,
      diaVencimento: 5,
      responsavel: {
        nome: "José Souza Lima",
        cpf: "76543210988",
        parentesco: "Pai",
        telefone: "(48) 99988-0003",
        isFinanceiro: true,
      },
    },
  ];

  for (const { responsavel, ...pacienteData } of pacientesData) {
    const existing = await prisma.paciente.findUnique({
      where: { cpf: pacienteData.cpf },
    });

    if (!existing) {
      const paciente = await prisma.paciente.create({
        data: pacienteData,
      });

      await prisma.responsavel.create({
        data: {
          pacienteId: paciente.id,
          ...responsavel,
        },
      });

      console.log(`  ✓ Paciente: ${paciente.nome}`);
    } else {
      console.log(`  ⊘ Paciente já existe: ${existing.nome}`);
    }
  }

  console.log("\n✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
