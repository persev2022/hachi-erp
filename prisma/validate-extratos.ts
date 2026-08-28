/**
 * DRY-RUN: Validates the parser against the bank statement running balances.
 * For each file, computes SALDO ANTERIOR + sum(transactions) and checks it matches
 * the final balance shown in the PDF. This ensures no transaction is missed or double-counted.
 *
 * Run: npx tsx prisma/validate-extratos.ts
 */
import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require("pdf-parse");

const EXTRATOS_DIR = "/Users/victoralapegna/Desktop/script adm/EXTRATOS 2026";
const LINE_REGEX = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d.]+,\d{2})\s+(-?[\d.]+,\d{2})\s*$/;

function parseBRNumber(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", "."));
}

async function validateFile(filePath: string, fileName: string) {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();

  const lines = result.text.split("\n");
  let saldoAnterior = 0;
  let saldoFinalReal = 0;
  let somaMovimentos = 0;
  let count = 0;
  let inFuture = false;
  let lastSaldo = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.includes("Lançamentos Futuros") || line.includes("Lancamentos Futuros")) { inFuture = true; continue; }
    if (inFuture) continue;

    const saldoAntMatch = line.match(/^SALDO ANTERIOR\s+(-?[\d.]+,\d{2})/);
    if (saldoAntMatch) { saldoAnterior = parseBRNumber(saldoAntMatch[1]); lastSaldo = saldoAnterior; continue; }

    const match = line.match(LINE_REGEX);
    if (!match) continue;

    const valor = parseBRNumber(match[3]);
    const saldo = parseBRNumber(match[4]);
    somaMovimentos += valor;
    lastSaldo = saldo;
    count++;
  }

  saldoFinalReal = lastSaldo;
  const saldoCalculado = saldoAnterior + somaMovimentos;
  const diff = Math.abs(saldoCalculado - saldoFinalReal);
  const ok = diff < 0.05; // tolerance for rounding

  console.log(`${fileName.padEnd(18)} | ${count} trans | Ant: ${saldoAnterior.toFixed(2)} | Movs: ${somaMovimentos.toFixed(2)} | Calc: ${saldoCalculado.toFixed(2)} | Real: ${saldoFinalReal.toFixed(2)} | ${ok ? "✅ OK" : `❌ DIFF ${diff.toFixed(2)}`}`);
  return { ok, count };
}

async function main() {
  console.log("═══ VALIDAÇÃO (DRY-RUN) — Conferência de saldos ═══\n");
  const files = fs.readdirSync(EXTRATOS_DIR).filter(f => f.toLowerCase().endsWith(".pdf")).sort();
  let totalCount = 0;
  let allOk = true;
  for (const file of files) {
    const r = await validateFile(path.join(EXTRATOS_DIR, file), file);
    totalCount += r.count;
    if (!r.ok) allOk = false;
  }
  console.log(`\nTotal transações: ${totalCount}`);
  console.log(allOk ? "✅ TODOS os saldos conferem — parser está correto!" : "❌ Há divergências — revisar parser antes de importar");
}

main().catch(console.error);
