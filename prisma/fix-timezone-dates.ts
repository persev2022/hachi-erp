/**
 * Fix timezone bug: dates saved as midnight UTC (T00:00:00Z) shift to previous day
 * when displayed in Brazil (UTC-3). This script moves all date-only fields to noon UTC
 * (T12:00:00Z) so they display correctly in any timezone.
 * 
 * Run: npx tsx prisma/fix-timezone-dates.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing timezone dates (midnight UTC → noon UTC)...\n");

  const pacientes = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      dataNascimento: true,
      dataAdmissao: true,
      dataAltaPrevista: true,
      dataAlta: true,
    },
  });

  let fixed = 0;

  for (const p of pacientes) {
    const updates: any = {};

    // Fix dataNascimento if at midnight
    if (p.dataNascimento && p.dataNascimento.getUTCHours() === 0 && p.dataNascimento.getUTCMinutes() === 0) {
      const d = new Date(p.dataNascimento);
      d.setUTCHours(12, 0, 0, 0);
      updates.dataNascimento = d;
    }

    // Fix dataAdmissao if at midnight
    if (p.dataAdmissao && p.dataAdmissao.getUTCHours() === 0 && p.dataAdmissao.getUTCMinutes() === 0) {
      const d = new Date(p.dataAdmissao);
      d.setUTCHours(12, 0, 0, 0);
      updates.dataAdmissao = d;
    }

    // Fix dataAltaPrevista if at midnight
    if (p.dataAltaPrevista && p.dataAltaPrevista.getUTCHours() === 0 && p.dataAltaPrevista.getUTCMinutes() === 0) {
      const d = new Date(p.dataAltaPrevista);
      d.setUTCHours(12, 0, 0, 0);
      updates.dataAltaPrevista = d;
    }

    // Fix dataAlta if at midnight
    if (p.dataAlta && p.dataAlta.getUTCHours() === 0 && p.dataAlta.getUTCMinutes() === 0) {
      const d = new Date(p.dataAlta);
      d.setUTCHours(12, 0, 0, 0);
      updates.dataAlta = d;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.paciente.update({ where: { id: p.id }, data: updates });
      fixed++;
      console.log(`  ✓ ${p.nome} — ${Object.keys(updates).join(", ")}`);
    }
  }

  console.log(`\n✅ ${fixed} pacientes corrigidos de ${pacientes.length} total.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
