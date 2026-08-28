/**
 * DRY-RUN by default. Matches PIX receitas to acolhidos/responsáveis by name.
 * Only high-confidence matches are proposed:
 *   - Payer name matches an acolhido's full name (all name tokens present), OR
 *   - Payer name matches a responsável financeiro's full name
 * Ambiguous matches (multiple candidates, partial single-token) are SKIPPED.
 *
 * Run dry:   npx tsx prisma/match-pagadores.ts
 * Run apply: npx tsx prisma/match-pagadores.ts --apply
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const APPLY = process.argv.includes("--apply");

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Extract the payer name from a PIX description
function extractPayerName(desc: string): string | null {
  const d = desc.toUpperCase();
  if (!d.includes("RECEBIMENTO PIX") && !d.includes("RECEB")) return null;

  // Pattern: "RECEBIMENTO PIX <cpf/cnpj> <NAME> [PIX_CRED|CXnnn]"
  let rest = desc.replace(/RECEBIMENTO PIX/i, "").trim();
  // remove leading CPF/CNPJ digits
  rest = rest.replace(/^\d{11,14}\s*/, "");
  // remove trailing document tokens
  rest = rest.replace(/\s*(PIX_CRED|PIXCOBRAN|CRED_COBPIX|CX\w+)\s*$/i, "");
  rest = rest.trim();
  return rest.length >= 3 ? rest : null;
}

// Check if payer name matches a target name with high confidence.
// Requires ALL tokens of the SHORTER name (min 2 tokens) to appear in the longer one.
function highConfidenceMatch(payer: string, target: string): boolean {
  const p = normalize(payer).split(" ").filter(t => t.length >= 3);
  const t = normalize(target).split(" ").filter(t => t.length >= 3);
  if (p.length < 2 || t.length < 2) return false;

  // Count how many of the target's significant tokens appear in the payer
  const shorter = p.length <= t.length ? p : t;
  const longer = p.length <= t.length ? t : p;
  const matched = shorter.filter(tok => longer.includes(tok)).length;

  // Require at least 2 matching tokens AND all tokens of the shorter set to match (>= 2)
  return matched >= 2 && matched === shorter.length;
}

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { slug: "ct-persev" } });
  if (!tenant) { console.error("Tenant não encontrado"); return; }

  // Load acolhidos + responsáveis
  const pacientes = await prisma.paciente.findMany({
    where: { tenantId: tenant.id, deletedAt: null },
    select: { id: true, nome: true, responsaveis: { select: { nome: true, isFinanceiro: true } } },
  });

  // Build candidate map: name -> pacienteId
  interface Candidate { pacienteId: string; pacienteNome: string; matchNome: string; via: string; }

  // Load PIX receitas not yet linked to a patient
  const receitas = await prisma.movimentacaoFinanceira.findMany({
    where: { tenantId: tenant.id, tipo: "RECEITA", pacienteId: null },
    select: { id: true, descricao: true, valor: true, dataVencimento: true },
  });

  console.log(`Acolhidos: ${pacientes.length} | Receitas sem vínculo: ${receitas.length}\n`);

  let matched = 0;
  let ambiguous = 0;
  let noMatch = 0;
  const toUpdate: { movId: string; pacienteId: string }[] = [];
  const matchLog: string[] = [];
  const ambiguousLog: string[] = [];

  for (const rec of receitas) {
    const payer = extractPayerName(rec.descricao);
    if (!payer) { noMatch++; continue; }

    // Find all candidates
    const candidates: Candidate[] = [];
    for (const pac of pacientes) {
      // Match against patient name
      if (highConfidenceMatch(payer, pac.nome)) {
        candidates.push({ pacienteId: pac.id, pacienteNome: pac.nome, matchNome: pac.nome, via: "acolhido" });
        continue;
      }
      // Match against responsável nome
      for (const resp of pac.responsaveis) {
        if (highConfidenceMatch(payer, resp.nome)) {
          candidates.push({ pacienteId: pac.id, pacienteNome: pac.nome, matchNome: resp.nome, via: "responsável" });
          break;
        }
      }
    }

    // Deduplicate by pacienteId
    const uniquePacientes = [...new Set(candidates.map(c => c.pacienteId))];

    if (uniquePacientes.length === 1) {
      const c = candidates[0];
      toUpdate.push({ movId: rec.id, pacienteId: c.pacienteId });
      matchLog.push(`  ✓ "${payer}" → ${c.pacienteNome} (via ${c.via}) | R$ ${rec.valor.toFixed(2)} ${rec.dataVencimento.toISOString().slice(0,10)}`);
      matched++;
    } else if (uniquePacientes.length > 1) {
      ambiguousLog.push(`  ? "${payer}" → AMBÍGUO (${candidates.map(c => c.pacienteNome).join(", ")}) — NÃO ALTERADO`);
      ambiguous++;
    } else {
      noMatch++;
    }
  }

  console.log("═══ MATCHES DE ALTA CONFIANÇA ═══");
  matchLog.forEach(l => console.log(l));
  console.log(`\n═══ AMBÍGUOS (não alterados) ═══`);
  ambiguousLog.forEach(l => console.log(l));

  console.log(`\n─────────────────────────────`);
  console.log(`Matches confiáveis: ${matched}`);
  console.log(`Ambíguos (ignorados): ${ambiguous}`);
  console.log(`Sem match (ignorados): ${noMatch}`);
  console.log(`─────────────────────────────`);

  if (APPLY) {
    console.log(`\n⚙️  Aplicando ${toUpdate.length} vínculos...`);
    for (const u of toUpdate) {
      await prisma.movimentacaoFinanceira.update({
        where: { id: u.movId },
        data: { pacienteId: u.pacienteId, categoria: "MENSALIDADE" },
      });
    }
    console.log(`✅ ${toUpdate.length} pagamentos vinculados a acolhidos.`);
  } else {
    console.log(`\n🔍 DRY-RUN (nada foi alterado). Rode com --apply para aplicar.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
