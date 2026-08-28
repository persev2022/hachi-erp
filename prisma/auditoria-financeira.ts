/**
 * AUDITORIA FORENSE dos dados financeiros da CT Persev.
 * READ-ONLY — não altera nada. Apenas diagnostica inconsistências.
 *
 * Verifica:
 * 1. Total no banco vs total nos extratos PDF (por mês)
 * 2. Duplicatas (mesma data + valor + descrição)
 * 3. Valores suspeitos (0, negativos, muito altos)
 * 4. Datas fora do range esperado
 * 5. Categorização (receitas classificadas como MENSALIDADE que não são pagamentos)
 * 6. Status inconsistente (PAGO sem dataPagamento, etc.)
 * 7. Transações órfãs (sem tenant)
 * 8. Diferença entre "previsto" (mensalidades dos pacientes) e "realizado"
 *
 * Run: npx tsx prisma/auditoria-financeira.ts
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require("pdf-parse");

const prisma = new PrismaClient();
const EXTRATOS_DIR = "/Users/victoralapegna/Desktop/script adm/EXTRATOS 2026";
const LINE_REGEX = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d.]+,\d{2})\s+(-?[\d.]+,\d{2})\s*$/;

function parseBRNumber(s: string): number { return parseFloat(s.replace(/\./g, "").replace(",", ".")); }

async function extractPdfTotals() {
  const files = fs.readdirSync(EXTRATOS_DIR).filter(f => f.toLowerCase().endsWith(".pdf")).sort();
  const byMonth: Record<string, { rec: number; desp: number; count: number }> = {};

  for (const file of files) {
    const buffer = fs.readFileSync(path.join(EXTRATOS_DIR, file));
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();

    const lines = result.text.split("\n");
    let inFuture = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (line.includes("Lançamentos Futuros") || line.includes("Lancamentos Futuros")) { inFuture = true; continue; }
      if (inFuture) continue;
      if (line.startsWith("SALDO ANTERIOR")) continue;
      const m = line.match(LINE_REGEX);
      if (!m) continue;
      const [, dataStr, , valorStr] = m;
      const valor = parseBRNumber(valorStr);
      if (valor === 0) continue;
      const [d, mo, y] = dataStr.split("/");
      const key = `${y}-${mo}`;
      if (!byMonth[key]) byMonth[key] = { rec: 0, desp: 0, count: 0 };
      byMonth[key].count++;
      if (valor > 0) byMonth[key].rec += valor;
      else byMonth[key].desp += Math.abs(valor);
    }
  }
  return byMonth;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  AUDITORIA FORENSE FINANCEIRA — CT PERSEV");
  console.log("═══════════════════════════════════════════════════════\n");

  const tenant = await prisma.tenant.findFirst({ where: { slug: "ct-persev" } });
  if (!tenant) { console.error("Tenant não encontrado"); return; }

  const movs = await prisma.movimentacaoFinanceira.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, tipo: true, categoria: true, descricao: true, valor: true, dataVencimento: true, dataPagamento: true, status: true, pacienteId: true, formaPagamento: true },
  });

  console.log(`Total de movimentações no banco: ${movs.length}\n`);

  // ═══ 1. BANCO vs EXTRATOS (por mês) ═══
  console.log("━━━ 1. BANCO vs EXTRATOS PDF (por competência) ━━━");
  const pdfTotals = await extractPdfTotals();
  const dbByMonth: Record<string, { rec: number; desp: number; count: number }> = {};
  for (const m of movs) {
    const key = m.dataVencimento.toISOString().slice(0, 7);
    if (!dbByMonth[key]) dbByMonth[key] = { rec: 0, desp: 0, count: 0 };
    dbByMonth[key].count++;
    if (m.tipo === "RECEITA") dbByMonth[key].rec += m.valor;
    else dbByMonth[key].desp += m.valor;
  }

  const allMonths = [...new Set([...Object.keys(pdfTotals), ...Object.keys(dbByMonth)])].sort();
  let divergencias = 0;
  for (const mo of allMonths) {
    const pdf = pdfTotals[mo] || { rec: 0, desp: 0, count: 0 };
    const db = dbByMonth[mo] || { rec: 0, desp: 0, count: 0 };
    const diffRec = Math.abs(pdf.rec - db.rec);
    const diffDesp = Math.abs(pdf.desp - db.desp);
    const diffCount = pdf.count - db.count;
    const ok = diffRec < 0.5 && diffDesp < 0.5 && diffCount === 0;
    console.log(`  ${mo}: PDF(${pdf.count} | R:${pdf.rec.toFixed(0)} D:${pdf.desp.toFixed(0)}) DB(${db.count} | R:${db.rec.toFixed(0)} D:${db.desp.toFixed(0)}) ${ok ? "✅" : `⚠️ diffCount=${diffCount} diffRec=${diffRec.toFixed(2)} diffDesp=${diffDesp.toFixed(2)}`}`);
    if (!ok) divergencias++;
  }
  console.log(divergencias === 0 ? "  → Sem divergências vs extratos ✅\n" : `  → ${divergencias} mês(es) divergentes ⚠️\n`);

  // ═══ 2. DUPLICATAS ═══
  console.log("━━━ 2. DUPLICATAS (mesma data + valor + descrição) ━━━");
  const seen: Record<string, number> = {};
  let dups = 0;
  for (const m of movs) {
    const key = `${m.dataVencimento.toISOString().slice(0,10)}|${m.valor}|${m.descricao}`;
    seen[key] = (seen[key] || 0) + 1;
  }
  const dupKeys = Object.entries(seen).filter(([_, c]) => c > 1);
  for (const [key, c] of dupKeys.slice(0, 20)) {
    console.log(`  ${c}x: ${key.slice(0, 80)}`);
    dups += c - 1;
  }
  console.log(`  → ${dupKeys.length} grupos com repetição (${dups} registros extras). NOTA: repetições legítimas existem (ex: 2 mensalidades do mesmo valor no mesmo dia).\n`);

  // ═══ 3. VALORES SUSPEITOS ═══
  console.log("━━━ 3. VALORES SUSPEITOS ━━━");
  const zeros = movs.filter(m => m.valor === 0);
  const negativos = movs.filter(m => m.valor < 0);
  const altos = movs.filter(m => m.valor > 20000);
  console.log(`  Valor zero: ${zeros.length}`);
  console.log(`  Valor negativo: ${negativos.length}`);
  console.log(`  Valor > R$20.000: ${altos.length}`);
  altos.forEach(m => console.log(`    - ${m.dataVencimento.toISOString().slice(0,10)} ${m.tipo} R$${m.valor.toFixed(2)} | ${m.descricao.slice(0,50)}`));
  console.log();

  // ═══ 4. DATAS FORA DO RANGE ═══
  console.log("━━━ 4. DATAS FORA DO RANGE (deve ser 2026) ━━━");
  const foraRange = movs.filter(m => {
    const y = m.dataVencimento.getUTCFullYear();
    return y < 2026 || y > 2026;
  });
  console.log(`  Fora de 2026: ${foraRange.length}`);
  foraRange.slice(0, 10).forEach(m => console.log(`    - ${m.dataVencimento.toISOString().slice(0,10)} | ${m.descricao.slice(0,50)}`));
  console.log();

  // ═══ 5. CATEGORIZAÇÃO SUSPEITA ═══
  console.log("━━━ 5. RECEITAS CLASSIFICADAS COMO MENSALIDADE MAS SÃO OUTRA COISA ━━━");
  const receitasMensalidade = movs.filter(m => m.tipo === "RECEITA" && m.categoria === "MENSALIDADE");
  // Non-patient-payment patterns among "MENSALIDADE"
  const naoMensalidade = receitasMensalidade.filter(m => {
    const d = m.descricao.toUpperCase();
    return d.includes("LIQ.COBRANCA") || d.includes("LIQ COBRANCA") || d.includes("TED") ||
           d.includes("DEP DINHEIRO") || d.includes("DEP.DINHEIRO") || d.includes("RESTAURANTE") ||
           d.includes("EPP") || d.includes("LTDA") || d.includes("REEMBOLSO") || d.includes("ESTORNO") ||
           d.includes("RENDIMENTO") || d.includes("APLIC") || d.includes("RESGATE") ||
           d.includes("SUGAR DESENTUP") || d.includes("PREVENFOR") || d.includes("FIORITEC") ||
           d.includes("RECEB. COB HIBRIDA") || d.includes("RECEB COB HIBRIDA");
  });
  console.log(`  Receitas 'MENSALIDADE' que parecem NÃO ser pagamento de acolhido: ${naoMensalidade.length}`);
  const totalNaoMensalidade = naoMensalidade.reduce((s, m) => s + m.valor, 0);
  console.log(`  Valor total dessas: R$ ${totalNaoMensalidade.toFixed(2)}`);
  naoMensalidade.slice(0, 25).forEach(m => console.log(`    - ${m.dataVencimento.toISOString().slice(0,10)} R$${m.valor.toFixed(2)} | ${m.descricao.slice(0,55)}`));
  console.log();

  // ═══ 6. STATUS INCONSISTENTE ═══
  console.log("━━━ 6. STATUS INCONSISTENTE ━━━");
  const pagoSemData = movs.filter(m => m.status === "PAGO" && !m.dataPagamento);
  const pendenteComData = movs.filter(m => m.status === "PENDENTE" && m.dataPagamento);
  console.log(`  PAGO sem dataPagamento: ${pagoSemData.length}`);
  console.log(`  PENDENTE com dataPagamento: ${pendenteComData.length}`);
  console.log();

  // ═══ 7. ÓRFÃS ═══
  console.log("━━━ 7. TRANSAÇÕES ÓRFÃS ━━━");
  const semTenant = await prisma.movimentacaoFinanceira.count({ where: { tenantId: null } });
  console.log(`  Movimentações sem tenant (global): ${semTenant}`);
  console.log();

  // ═══ 8. PREVISTO vs REALIZADO ═══
  console.log("━━━ 8. PREVISTO (mensalidades cadastradas) vs REALIZADO ━━━");
  const pacientesAtivos = await prisma.paciente.findMany({
    where: { tenantId: tenant.id, status: "ATIVO", deletedAt: null },
    select: { nome: true, mensalidadeValor: true },
  });
  const comMensalidade = pacientesAtivos.filter(p => p.mensalidadeValor && p.mensalidadeValor > 0);
  const semMensalidade = pacientesAtivos.filter(p => !p.mensalidadeValor || p.mensalidadeValor === 0);
  const previstoMensal = comMensalidade.reduce((s, p) => s + (p.mensalidadeValor || 0), 0);
  console.log(`  Acolhidos ativos: ${pacientesAtivos.length}`);
  console.log(`  Com mensalidade cadastrada: ${comMensalidade.length} (previsto R$ ${previstoMensal.toFixed(2)}/mês)`);
  console.log(`  SEM mensalidade cadastrada: ${semMensalidade.length} ⚠️`);
  semMensalidade.slice(0, 30).forEach(p => console.log(`    - ${p.nome}`));
  console.log();

  console.log("═══════════════════════════════════════════════════════");
  console.log("  FIM DA AUDITORIA (nenhum dado foi alterado)");
  console.log("═══════════════════════════════════════════════════════");
}

main().catch(console.error).finally(() => prisma.$disconnect());
