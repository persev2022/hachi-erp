import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Add missing patients (Osni, Lorenzo)
  const missing = [
    { nome: "Osni", d: "2026-06-15" },
    { nome: "Lorenzo", d: "2026-06-25" },
  ];

  for (const p of missing) {
    const ex = await prisma.paciente.findFirst({ where: { nome: { contains: p.nome, mode: "insensitive" } } });
    if (!ex) {
      await prisma.paciente.create({
        data: {
          nome: p.nome,
          cpf: "000" + Date.now().toString().slice(-8) + String(Math.floor(Math.random() * 99)).padStart(2, "0"),
          dataNascimento: new Date("1990-01-01"),
          sexo: "M",
          estadoCivil: "SOLTEIRO",
          dataAdmissao: new Date(p.d),
          diasTratamento: 90,
          status: "ATIVO",
        },
      });
      console.log("Criado:", p.nome);
    } else {
      console.log("Já existe:", p.nome);
    }
  }

  // Osni → Q-11
  const osni = await prisma.paciente.findFirst({ where: { nome: { contains: "Osni", mode: "insensitive" } } });
  const q11 = await prisma.quarto.findUnique({ where: { numero: "Q-11" } });
  if (osni && q11) {
    await prisma.paciente.update({ where: { id: osni.id }, data: { quartoId: q11.id } });
    console.log("Osni → Q-11");
  }

  // Maicon → sem quarto (não está no layout)
  const maicon = await prisma.paciente.findFirst({ where: { nome: { contains: "Maicon", mode: "insensitive" } } });
  if (maicon) {
    await prisma.paciente.update({ where: { id: maicon.id }, data: { quartoId: null } });
    console.log("Maicon → sem quarto");
  }

  // Lorenzo → Q-06
  const lorenzo = await prisma.paciente.findFirst({ where: { nome: { contains: "Lorenzo", mode: "insensitive" } } });
  const q06 = await prisma.quarto.findUnique({ where: { numero: "Q-06" } });
  if (lorenzo && q06) {
    await prisma.paciente.update({ where: { id: lorenzo.id }, data: { quartoId: q06.id } });
    console.log("Lorenzo → Q-06");
  }

  // Antonio Alex → Q-01 (fix duplicate from Q-05)
  const antonio = await prisma.paciente.findFirst({ where: { nome: { contains: "Antonio Alex", mode: "insensitive" } } });
  const q01 = await prisma.quarto.findUnique({ where: { numero: "Q-01" } });
  if (antonio && q01) {
    await prisma.paciente.update({ where: { id: antonio.id }, data: { quartoId: q01.id } });
    console.log("Antonio Alex → Q-01 (corrigido)");
  }

  await prisma.$disconnect();
  console.log("Done!");
}

main();
