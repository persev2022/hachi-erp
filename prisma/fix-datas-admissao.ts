/**
 * Atualiza datas de admissão dos acolhidos da CT Persev conforme planilha real.
 * Run: npx tsx prisma/fix-datas-admissao.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Planilha: nome parcial → data admissão (dd/mm/yy ou dd/mm/yyyy)
const planilha: { nome: string; data: string }[] = [
  { nome: "Caio", data: "14/09/2024" },
  { nome: "Fabricio Waschievice", data: "18/05/2025" },
  { nome: "Marcelo Henrique Baldi", data: "15/07/2025" },
  { nome: "Thiago Ferreira", data: "19/09/2025" },
  { nome: "Fernando Faria", data: "26/09/2025" },
  { nome: "Antonio Marco", data: "29/10/2025" },
  { nome: "Daniel Bento", data: "06/11/2025" },
  { nome: "Douglas Arrais", data: "11/02/2026" },
  { nome: "Nilson Vanderlin", data: "18/02/2026" },
  { nome: "Mateus Amandio", data: "27/02/2026" },
  { nome: "Felipe Ricardo Wathier", data: "05/03/2026" },
  { nome: "Marleon Coutinho", data: "15/04/2026" },
  { nome: "Kaiki", data: "18/04/2026" },
  { nome: "Marcelo Angelo", data: "15/05/2026" },
  { nome: "Jonathan Silva", data: "26/05/2026" },
  { nome: "Juciel", data: "30/05/2026" },
  { nome: "Alex Junior", data: "19/06/2026" },
  { nome: "Paulo Chagas", data: "20/06/2026" },
  { nome: "Daylon", data: "23/06/2026" },
  { nome: "Osni", data: "29/06/2026" },
  { nome: "Marlon King", data: "06/07/2026" },
  { nome: "Jorge", data: "11/07/2026" },
  { nome: "Robinson Regis", data: "15/07/2026" },
  { nome: "Henrique Jordani", data: "17/07/2026" },
  { nome: "Patrick Alan", data: "18/07/2026" },
  { nome: "Maicon de Jesus", data: "19/07/2026" },
  { nome: "Rossini", data: "24/07/2026" },
  { nome: "Lucas Machinick", data: "27/07/2026" },
  { nome: "Mario", data: "28/07/2026" },
  { nome: "Roger", data: "28/07/2026" },
  { nome: "Marcio Jean", data: "03/08/2026" },
  { nome: "Silvio", data: "04/08/2026" },
  { nome: "Diego Pereira", data: "04/08/2026" },
  { nome: "Boris", data: "06/08/2026" },
  { nome: "Jose Henrique", data: "08/08/2026" },
  { nome: "Pedro Rix", data: "11/08/2026" },
  { nome: "Kauan", data: "17/08/2026" },
  { nome: "Cristiano", data: "18/08/2026" },
];

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  // Use noon UTC to avoid timezone shift
  return new Date(Date.UTC(fullYear, month - 1, day, 12, 0, 0));
}

async function main() {
  console.log("📋 Atualizando datas de admissão conforme planilha...\n");

  // Get CT Persev tenant
  const tenant = await prisma.tenant.findFirst({ where: { slug: "ct-persev" } });
  if (!tenant) {
    console.error("❌ Tenant ct-persev não encontrado!");
    return;
  }

  // Get all active patients from this tenant
  const pacientes = await prisma.paciente.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, nome: true, dataAdmissao: true, status: true },
  });

  console.log(`  Encontrados ${pacientes.length} pacientes no tenant ct-persev\n`);

  let updated = 0;
  let notFound: string[] = [];

  for (const entry of planilha) {
    // Fuzzy match by name (case insensitive, partial match)
    const searchTerm = entry.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const match = pacientes.find(p => {
      const pNome = p.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return pNome.includes(searchTerm) || searchTerm.split(" ").every(word => pNome.includes(word));
    });

    if (!match) {
      notFound.push(entry.nome);
      continue;
    }

    const newDate = parseDate(entry.data);
    const oldDate = match.dataAdmissao;

    // Only update if different
    const oldStr = oldDate.toISOString().split("T")[0];
    const newStr = newDate.toISOString().split("T")[0];

    if (oldStr !== newStr) {
      await prisma.paciente.update({
        where: { id: match.id },
        data: { dataAdmissao: newDate },
      });
      console.log(`  ✓ ${match.nome}: ${oldStr} → ${newStr}`);
      updated++;
    } else {
      console.log(`  = ${match.nome}: já correto (${newStr})`);
    }
  }

  console.log(`\n✅ ${updated} pacientes atualizados.`);
  if (notFound.length > 0) {
    console.log(`\n⚠️  Não encontrados (${notFound.length}):`);
    notFound.forEach(n => console.log(`   - ${n}`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
