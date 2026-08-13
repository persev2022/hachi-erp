/**
 * Import Sicredi bank statement for CT Persev.
 * All records isolated to ct-persev tenant.
 * Run: npx tsx prisma/import-extrato-persev.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Categorize based on description
function categorize(desc: string): { tipo: "RECEITA" | "DESPESA"; categoria: string } {
  const d = desc.toUpperCase();
  if (d.includes("RECEBIMENTO PIX") || d.includes("DEP DINHEIRO")) {
    return { tipo: "RECEITA", categoria: "MENSALIDADE" };
  }
  if (d.includes("KOMPRAO") || d.includes("SUPERMERCADO") || d.includes("MERCADO") || d.includes("BUFFON") || d.includes("DESCONTO FACIL") || d.includes("MANENTTI")) {
    return { tipo: "DESPESA", categoria: "ALIMENTACAO" };
  }
  if (d.includes("POSTO") || d.includes("AUTOPISTA") || d.includes("SEM PARAR") || d.includes("VIA FACIL")) {
    return { tipo: "DESPESA", categoria: "TRANSPORTE" };
  }
  if (d.includes("FARMACIA") || d.includes("SAUDE MENTAL") || d.includes("MARLIZE CARVALHO")) {
    return { tipo: "DESPESA", categoria: "MEDICAMENTO" };
  }
  if (d.includes("VIVO") || d.includes("NETFLIX") || d.includes("JOBWAY") || d.includes("KONZEN")) {
    return { tipo: "DESPESA", categoria: "OUTRO" };
  }
  if (d.includes("PAGAMENTO PIX") || d.includes("LIQUIDACAO") || d.includes("DEB.CTA")) {
    return { tipo: "DESPESA", categoria: "OUTRO" };
  }
  if (d.includes("IOF") || d.includes("JUROS") || d.includes("TARIFA") || d.includes("CUSTAS") || d.includes("CESTA")) {
    return { tipo: "DESPESA", categoria: "OUTRO" };
  }
  if (d.includes("CONSORCIO") || d.includes("MAPFRE") || d.includes("VIDA SEGURADORA")) {
    return { tipo: "DESPESA", categoria: "OUTRO" };
  }
  return { tipo: "DESPESA", categoria: "OUTRO" };
}

// Parse the statement data
const transactions = [
  // July 2026
  { data: "2026-07-01", desc: "RECEBIMENTO PIX CLAUDIANA MARIA DE V", valor: 1600 },
  { data: "2026-07-01", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -2372.54 },
  { data: "2026-07-01", desc: "COMPRAS NACIONAIS PostoDoRosa IMBITUBA", valor: -150 },
  { data: "2026-07-01", desc: "PAGAMENTO PIX ADONAI CENTRO TERAP", valor: -250 },
  { data: "2026-07-01", desc: "JUROS UTILIZ.CH.ESPECIAL", valor: -516.99 },
  { data: "2026-07-02", desc: "PAGAMENTO PIX DANIEL CAMPOS CASCAES", valor: -100 },
  { data: "2026-07-02", desc: "PAGAMENTO PIX DIEGO BORGES BACCI", valor: -1500 },
  { data: "2026-07-06", desc: "RECEBIMENTO PIX MARIA TEREZINHA MINA", valor: 2200 },
  { data: "2026-07-06", desc: "RECEBIMENTO PIX Maria Angela Washing", valor: 1000 },
  { data: "2026-07-06", desc: "RECEBIMENTO PIX JANECI APARECIDA", valor: 1800 },
  { data: "2026-07-06", desc: "RECEBIMENTO PIX Danielle Fernandes", valor: 1900 },
  { data: "2026-07-06", desc: "RECEBIMENTO PIX JOHANNES PETER ANTON", valor: 1800 },
  { data: "2026-07-06", desc: "RECEBIMENTO PIX Marcos Angelo", valor: 600 },
  { data: "2026-07-06", desc: "PAGAMENTO PIX GABRIEL IGNACIO", valor: -2000 },
  { data: "2026-07-06", desc: "PAGAMENTO PIX LUAN MAR", valor: -700 },
  { data: "2026-07-06", desc: "LIQUIDACAO DE PARCELA", valor: -5291.89 },
  { data: "2026-07-07", desc: "RECEBIMENTO PIX CATARINA R S SOUZA", valor: 2200 },
  { data: "2026-07-07", desc: "RECEBIMENTO PIX LILIANE DE SOUZA MAR", valor: 1500 },
  { data: "2026-07-07", desc: "PAGAMENTO PIX MARCOS VINICIUS DOS SA", valor: -1000 },
  { data: "2026-07-08", desc: "RECEBIMENTO PIX SALETE TEREZINHA BET", valor: 250 },
  { data: "2026-07-08", desc: "DEP DINHEIRO CAIXA AG", valor: 2000 },
  { data: "2026-07-08", desc: "RECEBIMENTO PIX KENYVER DAGOSTIM", valor: 2500 },
  { data: "2026-07-08", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -2316.41 },
  { data: "2026-07-10", desc: "RECEBIMENTO PIX EDESON WISOSKI", valor: 2500 },
  { data: "2026-07-10", desc: "RECEBIMENTO PIX MARIA APARECIDA TAVA", valor: 500 },
  { data: "2026-07-10", desc: "RECEBIMENTO PIX ANDREW CONRRADO SCAB", valor: 2351 },
  { data: "2026-07-10", desc: "DEBITO CONVENIOS VIA FACIL/SEM PARAR", valor: -429.10 },
  { data: "2026-07-10", desc: "DEBITO CONVENIOS VIDA SEGURADORA", valor: -92.65 },
  { data: "2026-07-13", desc: "RECEBIMENTO PIX LUAN IGOR TRAPLE LIM", valor: 540 },
  { data: "2026-07-13", desc: "RECEBIMENTO PIX STEPHANIE DE MORAIS", valor: 79 },
  { data: "2026-07-13", desc: "RECEBIMENTO PIX Marcos Angelo", valor: 200 },
  { data: "2026-07-13", desc: "PAGAMENTO PIX DIEGO BORGES BACCI", valor: -1300 },
  { data: "2026-07-13", desc: "PAGAMENTO PIX BIT GAS DISTRIBUIDO", valor: -525 },
  { data: "2026-07-15", desc: "RECEBIMENTO PIX NILZE T S XAVIER", valor: 1800 },
  { data: "2026-07-15", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -1700.44 },
  { data: "2026-07-17", desc: "RECEBIMENTO PIX Fatima Aparecida De", valor: 3150 },
  { data: "2026-07-17", desc: "RECEBIMENTO PIX ALCIDES JOSE PEREIRA", valor: 2000 },
  { data: "2026-07-17", desc: "DEBITO CONVENIOS VIVO PR/SC", valor: -368 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX FFAM ADMINISTRADO", valor: 4000 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX ALISON VANDERLIND", valor: 2200 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX Mateus de Jesus", valor: 8000 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX KENYVER DAGOSTIM", valor: 2500 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX CLAUDETE CHAGAS", valor: 2400 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX SEU BRAGANCA BAR", valor: 4000 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX MARGARIDA MARIA S M", valor: 2200 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX ANDREIA LAUFFER", valor: 2000 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX FLAVIA FARIA", valor: 3500 },
  { data: "2026-07-20", desc: "RECEBIMENTO PIX FERNANDA WASCHIEVICZ", valor: 1500 },
  { data: "2026-07-20", desc: "PAGAMENTO PIX GABRIEL IGNACIO", valor: -1400 },
  { data: "2026-07-20", desc: "PAGAMENTO PIX SAUDE MENTAL 24H", valor: -1800 },
  { data: "2026-07-20", desc: "LIQUIDACAO DE PARCELA", valor: -1083.13 },
  { data: "2026-07-20", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -334.91 },
  { data: "2026-07-22", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -2408.57 },
  { data: "2026-07-23", desc: "RECEBIMENTO PIX FRANCILENE SILVA", valor: 2000 },
  { data: "2026-07-23", desc: "RECEBIMENTO PIX CARLA VALERIA LEITE", valor: 2200 },
  { data: "2026-07-23", desc: "PAGAMENTO PIX CESAR AUGUSTO MACHADO", valor: -2300 },
  { data: "2026-07-27", desc: "RECEBIMENTO PIX R. D. PADILHA LTD", valor: 1350 },
  { data: "2026-07-27", desc: "RECEBIMENTO PIX Kethryn Da Silva", valor: 1600 },
  { data: "2026-07-27", desc: "LIQUIDACAO DE PARCELA", valor: -10305.16 },
  { data: "2026-07-27", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -160.81 },
  { data: "2026-07-29", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -2394.31 },
  { data: "2026-07-30", desc: "RECEBIMENTO PIX CLAUDIANA MARIA", valor: 1600 },
  { data: "2026-07-31", desc: "RECEBIMENTO PIX CLAUCEMAR GETULIO", valor: 500 },
  { data: "2026-07-31", desc: "RECEBIMENTO PIX HERMES AFONSO KRETZE", valor: 3000 },
  // August 2026
  { data: "2026-08-03", desc: "RECEBIMENTO PIX DIEGO VANDERLEI BOSS", valor: 1000 },
  { data: "2026-08-03", desc: "RECEBIMENTO PIX Marcos Angelo", valor: 400 },
  { data: "2026-08-03", desc: "JUROS UTILIZ.CH.ESPECIAL", valor: -607.48 },
  { data: "2026-08-04", desc: "LIQUIDACAO DE PARCELA", valor: -5291.89 },
  { data: "2026-08-04", desc: "RECEBIMENTO PIX MARGARIDA PEREIRA", valor: 1000 },
  { data: "2026-08-05", desc: "RECEBIMENTO PIX MARGARIDA PEREIRA", valor: 1500 },
  { data: "2026-08-05", desc: "RECEBIMENTO PIX NELMA INES KRETZER", valor: 1700 },
  { data: "2026-08-05", desc: "RECEBIMENTO PIX JANETE PISKE", valor: 1800 },
  { data: "2026-08-05", desc: "RECEBIMENTO PIX Marilene Miola Ferna", valor: 1900 },
  { data: "2026-08-05", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -1352.28 },
  { data: "2026-08-07", desc: "RECEBIMENTO PIX JANECI APARECIDA", valor: 1800 },
  { data: "2026-08-07", desc: "RECEBIMENTO PIX LILIANE DE SOUZA MAR", valor: 1500 },
  { data: "2026-08-07", desc: "RECEBIMENTO PIX ANDREW CONRRADO SCAB", valor: 2351 },
  { data: "2026-08-07", desc: "RECEBIMENTO PIX Marcelo Alves Padilh", valor: 800 },
  { data: "2026-08-07", desc: "PAGAMENTO PIX DIEGO BORGES BACCI", valor: -2000 },
  { data: "2026-08-10", desc: "RECEBIMENTO PIX JAIR GALVAO DA SILVA", valor: 894 },
  { data: "2026-08-10", desc: "RECEBIMENTO PIX Marcos Angelo", valor: 200 },
  { data: "2026-08-10", desc: "DEBITO CONVENIOS VIA FACIL/SEM PARAR", valor: -447.74 },
  { data: "2026-08-10", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -84.87 },
  { data: "2026-08-11", desc: "RECEBIMENTO PIX ROGERIO REGIS", valor: 2000 },
  { data: "2026-08-11", desc: "RECEBIMENTO PIX MARIA VERA RIX", valor: 2000 },
  { data: "2026-08-11", desc: "RECEBIMENTO PIX MARIA TEREZINHA MINA", valor: 2200 },
  { data: "2026-08-11", desc: "RECEBIMENTO PIX JOSE CARLOS DA SILVA", valor: 1000 },
  { data: "2026-08-12", desc: "COMPRAS NACIONAIS KOMPRAO TIJUCAS", valor: -2345 },
  { data: "2026-08-12", desc: "PAGAMENTO PIX Clayton Nunes da Silva", valor: -3000 },
];

async function main() {
  console.log("💰 Importando extrato Sicredi para CT Persev...\n");

  const tenant = await prisma.tenant.findUnique({ where: { slug: "ct-persev" } });
  if (!tenant) { console.error("CT Persev não encontrado"); process.exit(1); }

  let receitas = 0, despesas = 0, count = 0;

  for (const tx of transactions) {
    const { tipo, categoria } = categorize(tx.desc);
    const valor = Math.abs(tx.valor);

    await prisma.movimentacaoFinanceira.create({
      data: {
        tipo,
        categoria: categoria as any,
        descricao: tx.desc.slice(0, 100),
        valor,
        dataVencimento: new Date(tx.data),
        dataPagamento: new Date(tx.data),
        status: "PAGO",
        formaPagamento: tx.desc.includes("PIX") ? "Pix" : tx.desc.includes("COMPRAS") ? "Cartão" : "Boleto",
        tenantId: tenant.id,
      },
    });

    if (tipo === "RECEITA") receitas += valor;
    else despesas += valor;
    count++;
  }

  console.log(`  ✓ ${count} transações importadas`);
  console.log(`  💚 Receitas: R$ ${receitas.toFixed(2)}`);
  console.log(`  🔴 Despesas: R$ ${despesas.toFixed(2)}`);
  console.log(`  📊 Resultado: R$ ${(receitas - despesas).toFixed(2)}`);
  console.log("\n✅ Extrato importado com sucesso (isolado ao tenant ct-persev)");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
