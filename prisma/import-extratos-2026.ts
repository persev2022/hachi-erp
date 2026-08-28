/**
 * Imports all 2026 bank statements (Jan-Aug) into the CT Persev financial module.
 *
 * Strategy:
 * 1. Delete all existing bank-statement movimentações (sem pacienteId) to avoid duplication
 * 2. Preserve manually-linked mensalidades (com pacienteId)
 * 3. Parse each PDF, extract transactions, categorize, and import
 * 4. Skip "Lançamentos Futuros" (haven't happened yet)
 *
 * Run: npx tsx prisma/import-extratos-2026.ts
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require("pdf-parse");

const prisma = new PrismaClient();
const EXTRATOS_DIR = "/Users/victoralapegna/Desktop/script adm/EXTRATOS 2026";

interface Transacao {
  data: Date;
  descricao: string;
  valor: number; // positive = receita, negative = despesa
  tipo: "RECEITA" | "DESPESA";
  categoria: string;
}

// Match a transaction line: DD/MM/YYYY <descricao> <valor> <saldo>
// Values are BR format: 1.234,56 or -1.234,56
const LINE_REGEX = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d.]+,\d{2})\s+(-?[\d.]+,\d{2})\s*$/;

function parseBRNumber(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", "."));
}

function parseDate(s: string): Date {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function categorize(desc: string, tipo: "RECEITA" | "DESPESA"): string {
  const d = desc.toUpperCase();

  if (tipo === "RECEITA") {
    // Receitas: PIX recebido, liquidação de cobrança, TED, depósito
    return "MENSALIDADE"; // Most receitas are patient payments; treat as MENSALIDADE by default
  }

  // Despesas
  if (d.includes("KOMPRAO") || d.includes("SUPERMERCADO") || d.includes("MANENTTI") || d.includes("AGROROSA") || d.includes("MP MAODEDEUS")) return "ALIMENTACAO";
  if (d.includes("BIT GAS") || d.includes("GAS DISTRIBUIDO")) return "ALIMENTACAO";
  if (d.includes("POSTO") || d.includes("POSTOLAGOA") || d.includes("PST AMIZADE") || d.includes("SEM PARAR") || d.includes("VIA FACIL")) return "TRANSPORTE";
  if (d.includes("SAUDE MANTAL") || d.includes("SAUDE MENTAL") || d.includes("MEDICAMENTO") || d.includes("FARMACIA") || d.includes("DROGARIA")) return "MEDICAMENTO";
  if (d.includes("LAVANDERIA")) return "LAVANDERIA";
  // Everything else is OUTRO (tarifas, pagamentos de pessoal, materiais, etc.)
  return "OUTRO";
}

async function parseExtrato(filePath: string): Promise<Transacao[]> {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();

  const lines = result.text.split("\n");
  const transacoes: Transacao[] = [];
  let inFutureSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Stop parsing when we hit "Lançamentos Futuros"
    if (line.includes("Lançamentos Futuros") || line.includes("Lancamentos Futuros")) {
      inFutureSection = true;
      continue;
    }
    if (inFutureSection) continue;

    // Skip headers and non-transaction lines
    if (line.startsWith("SALDO ANTERIOR")) continue;
    if (line.startsWith("Data Descrição")) continue;
    if (line.startsWith("--") || line === "") continue;

    const match = line.match(LINE_REGEX);
    if (!match) continue;

    const [, dataStr, descricao, valorStr] = match;
    const valor = parseBRNumber(valorStr);
    if (valor === 0) continue;

    const tipo = valor > 0 ? "RECEITA" : "DESPESA";
    const categoria = categorize(descricao, tipo);

    transacoes.push({
      data: parseDate(dataStr),
      descricao: descricao.replace(/\s+/g, " ").trim(),
      valor: Math.abs(valor),
      tipo,
      categoria,
    });
  }

  return transacoes;
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("IMPORTAÇÃO DE EXTRATOS 2026 — CT PERSEV");
  console.log("═══════════════════════════════════════════════\n");

  const tenant = await prisma.tenant.findFirst({ where: { slug: "ct-persev" } });
  if (!tenant) { console.error("❌ Tenant ct-persev não encontrado!"); return; }
  console.log(`Tenant: ${tenant.name} (${tenant.id})\n`);

  // 1. Delete existing bank-statement movimentações (sem pacienteId)
  const deleted = await prisma.movimentacaoFinanceira.deleteMany({
    where: { tenantId: tenant.id, pacienteId: null },
  });
  console.log(`🗑️  ${deleted.count} movimentações antigas de extrato removidas (preservando as vinculadas a pacientes)\n`);

  // 2. Parse all PDFs
  const files = fs.readdirSync(EXTRATOS_DIR).filter(f => f.toLowerCase().endsWith(".pdf")).sort();
  const todasTransacoes: Transacao[] = [];

  for (const file of files) {
    const trans = await parseExtrato(path.join(EXTRATOS_DIR, file));
    todasTransacoes.push(...trans);
    const rec = trans.filter(t => t.tipo === "RECEITA");
    const desp = trans.filter(t => t.tipo === "DESPESA");
    const totalRec = rec.reduce((s, t) => s + t.valor, 0);
    const totalDesp = desp.reduce((s, t) => s + t.valor, 0);
    const periodo = trans.length > 0
      ? `${trans[0].data.toISOString().slice(0, 7)}`
      : "vazio";
    console.log(`  ${file.padEnd(18)} → ${trans.length} trans | ${rec.length} rec (R$ ${totalRec.toFixed(2)}) | ${desp.length} desp (R$ ${totalDesp.toFixed(2)})`);
  }

  console.log(`\n📊 Total: ${todasTransacoes.length} transações extraídas`);

  // 3. Import in batches
  const BATCH = 100;
  let imported = 0;
  for (let i = 0; i < todasTransacoes.length; i += BATCH) {
    const batch = todasTransacoes.slice(i, i + BATCH);
    await prisma.movimentacaoFinanceira.createMany({
      data: batch.map(t => ({
        tipo: t.tipo as any,
        categoria: t.categoria as any,
        descricao: t.descricao,
        valor: t.valor,
        dataVencimento: t.data,
        dataPagamento: t.data, // bank statement = already settled
        status: "PAGO" as any,
        formaPagamento: t.descricao.toUpperCase().includes("PIX") ? "Pix" :
          t.descricao.toUpperCase().includes("BOLETO") ? "Boleto" :
          t.descricao.toUpperCase().includes("TED") ? "Transferência" : "Outro",
        tenantId: tenant.id,
      })),
    });
    imported += batch.length;
  }

  console.log(`\n✅ ${imported} transações importadas com sucesso!`);

  // 4. Final summary by month
  const movs = await prisma.movimentacaoFinanceira.findMany({
    where: { tenantId: tenant.id },
    select: { dataVencimento: true, tipo: true, valor: true },
  });
  const byMonth: Record<string, { rec: number; desp: number; count: number }> = {};
  for (const m of movs) {
    const key = m.dataVencimento.toISOString().slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { rec: 0, desp: 0, count: 0 };
    byMonth[key].count++;
    if (m.tipo === "RECEITA") byMonth[key].rec += m.valor;
    else byMonth[key].desp += m.valor;
  }
  console.log("\n═══ RESUMO FINAL POR COMPETÊNCIA ═══");
  Object.keys(byMonth).sort().forEach(k => {
    const b = byMonth[k];
    console.log(`  ${k}: ${b.count} movs | Rec: R$ ${b.rec.toFixed(2)} | Desp: R$ ${b.desp.toFixed(2)} | Resultado: R$ ${(b.rec - b.desp).toFixed(2)}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
