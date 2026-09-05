/**
 * Importa o extrato de setembro/2026 (01/09 a 04/09) na CT Persev.
 * Transações digitadas do PDF Sicredi. Valida saldo antes de importar.
 * Idempotente: remove setembro existente antes de reimportar (evita duplicação).
 *
 * Run: npx tsx prisma/import-setembro-2026.ts [--apply]
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const SALDO_ANTERIOR = -11305.72;

// Transações do extrato de setembro (data, descricao, valor com sinal, saldo esperado)
const TRANSACOES: { data: string; descricao: string; valor: number; saldo: number }[] = [
  { data: "2026-09-01", descricao: "COMPRAS NACIONAIS DESCONTO FACIL GAROPABA BR", valor: -78.80, saldo: -11384.52 },
  { data: "2026-09-01", descricao: "RECEBIMENTO PIX 10479670000196 FUNDO MUNICIPAL D PIX_CRED", valor: 5600.00, saldo: -5784.52 },
  { data: "2026-09-01", descricao: "COMPRAS NACIONAIS PostoPetropaba GAROPABA BR", valor: -100.00, saldo: -5884.52 },
  { data: "2026-09-01", descricao: "RECEBIMENTO PIX 35232200097 CHEILA ROSANE SOUZA PIX_CRED", valor: 1500.00, saldo: -4384.52 },
  { data: "2026-09-01", descricao: "PAGAMENTO PIX 54928467000125 SLT ODONTOLOGIA PIX_DEB", valor: -190.00, saldo: -4574.52 },
  { data: "2026-09-01", descricao: "IOF ADICIONAL PJ-CH. ESPE", valor: -132.36, saldo: -4706.88 },
  { data: "2026-09-01", descricao: "IOF BASICO CH PJ", valor: -8.61, saldo: -4715.49 },
  { data: "2026-09-01", descricao: "JUROS UTILIZ.CH.ESPECIAL", valor: -898.95, saldo: -5614.44 },
  { data: "2026-09-02", descricao: "PAGAMENTO PIX 00802221963 Diego Ariel Worner PIX_DEB", valor: -500.00, saldo: -6114.44 },
  { data: "2026-09-02", descricao: "COMPRAS NACIONAIS KOMPRAO TIJUCAS BR", valor: -2764.12, saldo: -8878.56 },
  { data: "2026-09-02", descricao: "PAGAMENTO PIX 52298518000157 ADONAI CENTRO TERAP PIX_DEB", valor: -1250.00, saldo: -10128.56 },
  { data: "2026-09-03", descricao: "COMPRAS NACIONAIS KOMPRAO TIJUCAS BR", valor: -89.84, saldo: -10218.40 },
  { data: "2026-09-03", descricao: "COMPRAS NACIONAIS MABEL MAT CONSTRUCAO GAROPABA", valor: -53.00, saldo: -10271.40 },
  { data: "2026-09-03", descricao: "RECEBIMENTO PIX 13525027982 MARCYA M ASCARI ASSU PIX_CRED", valor: 1800.00, saldo: -8471.40 },
  { data: "2026-09-03", descricao: "RECEBIMENTO PIX 12450330852 ANDRE LUIZ HEIDRICH CX378706", valor: 4500.00, saldo: -3971.40 },
  { data: "2026-09-03", descricao: "PAGAMENTO PIX 05506560000136 NIC. BR PIX_DEB", valor: -184.00, saldo: -4155.40 },
  { data: "2026-09-03", descricao: "COMPRAS NACIONAIS DESCONTO FACIL GAROPABA BR", valor: -18.83, saldo: -4174.23 },
  { data: "2026-09-03", descricao: "PAGAMENTO PIX 00802221963 Diego Ariel Worner PIX_DEB", valor: -300.00, saldo: -4474.23 },
  { data: "2026-09-04", descricao: "LIQUIDACAO DE PARCELA C52630107", valor: -5291.89, saldo: -9766.12 },
  { data: "2026-09-04", descricao: "COMPRAS NACIONAIS MATHEUS AUTOMOTIVO IMBITUBA BR", valor: -50.00, saldo: -9816.12 },
  { data: "2026-09-04", descricao: "RECEBIMENTO PIX 40518868915 JANECI APARECIDA DA PIX_CRE", valor: 1800.00, saldo: -8016.12 },
  { data: "2026-09-04", descricao: "COMPRAS NACIONAIS GECAR AUTO ELETRICA E IMBITUBA", valor: -100.00, saldo: -8116.12 },
  { data: "2026-09-04", descricao: "COMPRAS NACIONAIS PostoPetropaba GAROPABA BR", valor: -14.25, saldo: -8130.37 },
  { data: "2026-09-04", descricao: "COMPRAS NACIONAIS PostoPetropaba GAROPABA BR", valor: -4.00, saldo: -8134.37 },
  { data: "2026-09-04", descricao: "RECEBIMENTO PIX 54542960900 JOI GUEDES DA FONSEC PIX_CRED", valor: 1800.00, saldo: -6334.37 },
  { data: "2026-09-04", descricao: "COMPRAS NACIONAIS POSTO SIMON IMBITUBA BR", valor: -100.00, saldo: -6434.37 },
  { data: "2026-09-04", descricao: "TED 08858200000191 SC 421150 FMS CUSTEIO SUS 104799", valor: 11200.00, saldo: 4765.63 },
  { data: "2026-09-04", descricao: "COMPRAS NACIONAIS ValperPneusEBikes GAROPABA BR", valor: -80.00, saldo: 4685.63 },
];

function categorize(desc: string, tipo: "RECEITA" | "DESPESA"): string {
  const d = desc.toUpperCase();
  if (tipo === "RECEITA") return "MENSALIDADE";
  if (d.includes("KOMPRAO") || d.includes("SUPERMERCADO") || d.includes("MERCADO")) return "ALIMENTACAO";
  if (d.includes("POSTO") || d.includes("PETROPABA") || d.includes("SIMON") || d.includes("AUTOMOTIVO") || d.includes("AUTO ELETRICA") || d.includes("PNEUS")) return "TRANSPORTE";
  if (d.includes("ODONTOLOGIA") || d.includes("FARMACIA") || d.includes("DROGARIA")) return "MEDICAMENTO";
  return "OUTRO";
}

function parseDate(s: string): Date {
  return new Date(`${s}T12:00:00.000Z`);
}

async function main() {
  console.log("═══ IMPORTAÇÃO EXTRATO SETEMBRO/2026 ═══\n");

  // 1. Validar saldos
  let saldoCalc = SALDO_ANTERIOR;
  let ok = true;
  for (const t of TRANSACOES) {
    saldoCalc += t.valor;
    if (Math.abs(saldoCalc - t.saldo) > 0.01) {
      console.log(`❌ DIVERGÊNCIA em ${t.data} "${t.descricao.slice(0,30)}": calc ${saldoCalc.toFixed(2)} vs esperado ${t.saldo.toFixed(2)}`);
      ok = false;
    }
  }
  console.log(`Saldo anterior: R$ ${SALDO_ANTERIOR.toFixed(2)}`);
  console.log(`Saldo final calculado: R$ ${saldoCalc.toFixed(2)} (esperado: R$ 4685.63)`);
  console.log(ok && Math.abs(saldoCalc - 4685.63) < 0.01 ? "✅ SALDOS CONFEREM\n" : "❌ REVISAR ANTES DE IMPORTAR\n");
  if (!ok) return;

  const tenant = await prisma.tenant.findFirst({ where: { slug: "ct-persev" } });
  if (!tenant) { console.error("Tenant não encontrado"); return; }

  // 2. Validar continuidade: fim de agosto deve = saldo anterior de setembro
  //    (Apenas informativo — o extrato oficial garante isso)
  console.log("Continuidade: saldo anterior de setembro = R$ -11.305,72 (fim de agosto real do banco)\n");

  const receitas = TRANSACOES.filter(t => t.valor > 0);
  const despesas = TRANSACOES.filter(t => t.valor < 0);
  console.log(`Total: ${TRANSACOES.length} transações | ${receitas.length} receitas (R$ ${receitas.reduce((s,t)=>s+t.valor,0).toFixed(2)}) | ${despesas.length} despesas (R$ ${Math.abs(despesas.reduce((s,t)=>s+t.valor,0)).toFixed(2)})`);

  if (APPLY) {
    // Remove existing September bank-statement movs (sem paciente) to avoid duplication
    const del = await prisma.movimentacaoFinanceira.deleteMany({
      where: {
        tenantId: tenant.id,
        pacienteId: null,
        dataVencimento: { gte: new Date("2026-09-01T00:00:00Z"), lte: new Date("2026-09-30T23:59:59Z") },
      },
    });
    console.log(`\n🗑️  ${del.count} movimentações de setembro antigas removidas`);

    await prisma.movimentacaoFinanceira.createMany({
      data: TRANSACOES.map(t => {
        const tipo = t.valor > 0 ? "RECEITA" : "DESPESA";
        return {
          tipo: tipo as any,
          categoria: categorize(t.descricao, tipo) as any,
          descricao: t.descricao,
          valor: Math.abs(t.valor),
          dataVencimento: parseDate(t.data),
          dataPagamento: parseDate(t.data),
          status: "PAGO" as any,
          formaPagamento: t.descricao.toUpperCase().includes("PIX") ? "Pix" : t.descricao.toUpperCase().includes("TED") ? "Transferência" : "Outro",
          tenantId: tenant.id,
        };
      }),
    });
    console.log(`✅ ${TRANSACOES.length} transações de setembro importadas.`);
  } else {
    console.log("\n🔍 DRY-RUN. Use --apply para importar.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
