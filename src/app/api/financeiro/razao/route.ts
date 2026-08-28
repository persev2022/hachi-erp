import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/financeiro/razao
 * RAZÃO CONTÁBIL UNIVERSAL (inspirado na ACDOCA do SAP S/4HANA)
 *
 * Cada movimentação financeira é transformada numa linha do razão com:
 * - Conta contábil (plano de contas estruturado)
 * - Natureza (débito/crédito)
 * - Centro de custo (CO)
 * - Contrapartida (partida dobrada)
 * - Business Partner (cliente/fornecedor unificado)
 *
 * Isso dá a "visão única da verdade financeira" que o SAP entrega.
 */

// Plano de Contas estruturado (Chart of Accounts)
const PLANO_CONTAS = {
  // ATIVO
  "1.1.1": { nome: "Caixa e Bancos", grupo: "ATIVO", tipo: "Circulante" },
  "1.1.2": { nome: "Contas a Receber", grupo: "ATIVO", tipo: "Circulante" },
  // RECEITAS
  "3.1.1": { nome: "Receita de Mensalidades", grupo: "RECEITA", tipo: "Operacional" },
  "3.1.2": { nome: "Receita de Matrículas", grupo: "RECEITA", tipo: "Operacional" },
  "3.1.9": { nome: "Repasses e Convênios (SUS/FMS)", grupo: "RECEITA", tipo: "Não Operacional" },
  "3.2.1": { nome: "Receitas Financeiras", grupo: "RECEITA", tipo: "Financeira" },
  "3.9.9": { nome: "Outras Receitas", grupo: "RECEITA", tipo: "Não Operacional" },
  // DESPESAS
  "4.1.1": { nome: "Alimentação e Suprimentos", grupo: "DESPESA", tipo: "Custo Direto" },
  "4.1.2": { nome: "Medicamentos e Insumos Clínicos", grupo: "DESPESA", tipo: "Custo Direto" },
  "4.1.3": { nome: "Lavanderia", grupo: "DESPESA", tipo: "Custo Direto" },
  "4.2.1": { nome: "Pessoal e Encargos", grupo: "DESPESA", tipo: "Operacional" },
  "4.2.2": { nome: "Transporte e Combustível", grupo: "DESPESA", tipo: "Operacional" },
  "4.2.3": { nome: "Telecomunicações e TI", grupo: "DESPESA", tipo: "Operacional" },
  "4.2.4": { nome: "Serviços e Manutenção", grupo: "DESPESA", tipo: "Operacional" },
  "4.2.5": { nome: "Seguros e Convênios", grupo: "DESPESA", tipo: "Operacional" },
  "4.3.1": { nome: "Despesas Financeiras (Juros/Tarifas)", grupo: "DESPESA", tipo: "Financeira" },
  "4.3.2": { nome: "Impostos e Taxas", grupo: "DESPESA", tipo: "Tributária" },
  "4.9.9": { nome: "Outras Despesas", grupo: "DESPESA", tipo: "Operacional" },
} as const;

// Mapeia uma movimentação para uma conta contábil (classificação inteligente)
function mapearConta(tipo: string, categoria: string, descricao: string): string {
  const d = descricao.toUpperCase();

  if (tipo === "RECEITA") {
    if (categoria === "MATRICULA") return "3.1.2";
    if (categoria === "MENSALIDADE") return "3.1.1";
    if (d.match(/FMS|SUS|FUNDO MUNICIPAL|PREFEITURA|CUSTEIO/)) return "3.1.9";
    if (d.match(/RESG.APLIC|RENDIMENTO|APLIC.FIN/)) return "3.2.1";
    return "3.9.9";
  }

  // DESPESA
  if (categoria === "ALIMENTACAO" || d.match(/KOMPRAO|SUPERMERCADO|MANENTTI|AGROROSA|MERCADO/)) return "4.1.1";
  if (categoria === "MEDICAMENTO" || d.match(/FARMACIA|DROGARIA|MEDICAMENTO|SAUDE MANTAL|SAUDE MENTAL/)) return "4.1.2";
  if (categoria === "LAVANDERIA") return "4.1.3";
  if (d.match(/POSTO|AUTOPISTA|SEM PARAR|VIA FACIL|COMBUSTIVEL/) || categoria === "TRANSPORTE") return "4.2.2";
  if (d.match(/VIVO|NETFLIX|JOBWAY|TELEFON|INTERNET/)) return "4.2.3";
  if (d.match(/MAPFRE|SEGURADORA|CONSORCIO/)) return "4.2.5";
  if (d.match(/TARIFA|CUSTAS|CESTA|PROTESTO|IOF|JUROS/)) return "4.3.1";
  if (d.match(/DARF|DAS |ARRECADACAO|IMPOSTO|TRIBUTO|INSS|FGTS/)) return "4.3.2";
  if (d.match(/ELETRO|MABEL|MULTI|MANUTENCAO|CONSTRUCAO|TINTAS|FIGUEIREDO/)) return "4.2.4";
  if (d.includes("PAGAMENTO PIX")) return "4.2.1"; // pessoal / repasses
  if (d.match(/LIQUIDACAO|PARCELA|FINANCIAMENTO/)) return "4.3.1";
  return "4.9.9";
}

function extractBusinessPartner(desc: string): string {
  if (desc.includes("PIX")) {
    const parts = desc.replace(/RECEBIMENTO PIX|PAGAMENTO PIX/gi, "").trim();
    const nome = parts.replace(/^\d{11,14}\s*/, "").replace(/^PIX_\w+\s*/, "").trim();
    return (nome.length < 3 ? parts.trim() : nome).slice(0, 40);
  }
  if (desc.includes("COMPRAS NACIONAIS")) return desc.replace("COMPRAS NACIONAIS", "").trim().split(" ").slice(0, 3).join(" ");
  return desc.slice(0, 35);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "FINANCEIRO", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: null });

    const { searchParams } = new URL(req.url);
    const conta = searchParams.get("conta"); // filter by specific account
    const mes = searchParams.get("mes"); // filter by month

    const where: any = { tenantId };
    const movs = await prisma.movimentacaoFinanceira.findMany({
      where,
      include: { paciente: { select: { nome: true } } },
      orderBy: { dataVencimento: "desc" },
    });

    // Build ledger lines (Universal Journal)
    let ledger = movs.map((m, idx) => {
      const contaId = mapearConta(m.tipo, m.categoria, m.descricao);
      const contaInfo = (PLANO_CONTAS as any)[contaId];
      const bp = m.paciente?.nome || extractBusinessPartner(m.descricao);
      // Double-entry: revenue = debit Caixa / credit Receita; expense = debit Despesa / credit Caixa
      const natureza = m.tipo === "RECEITA" ? "Crédito" : "Débito";
      const contrapartida = m.tipo === "RECEITA" ? "1.1.1" : "1.1.1";

      return {
        docNum: `DOC-${m.dataVencimento.toISOString().slice(0, 7).replace("-", "")}-${String(idx + 1).padStart(5, "0")}`,
        data: m.dataVencimento.toISOString().slice(0, 10),
        conta: contaId,
        contaNome: contaInfo?.nome || "Não Classificado",
        grupo: contaInfo?.grupo || "OUTRO",
        tipoConta: contaInfo?.tipo || "—",
        natureza,
        contrapartida,
        businessPartner: bp,
        historico: m.descricao,
        valor: m.valor,
        tipo: m.tipo,
        status: m.status,
        mes: m.dataVencimento.toISOString().slice(0, 7),
      };
    });

    // Apply filters
    if (conta) ledger = ledger.filter(l => l.conta === conta);
    if (mes) ledger = ledger.filter(l => l.mes === mes);

    // ═══ BALANCETE (Trial Balance) — saldo por conta ═══
    const balancete: Record<string, { conta: string; nome: string; grupo: string; tipo: string; debito: number; credito: number; saldo: number; count: number }> = {};
    for (const l of ledger) {
      if (!balancete[l.conta]) {
        balancete[l.conta] = { conta: l.conta, nome: l.contaNome, grupo: l.grupo, tipo: l.tipoConta, debito: 0, credito: 0, saldo: 0, count: 0 };
      }
      balancete[l.conta].count++;
      if (l.tipo === "RECEITA") balancete[l.conta].credito += l.valor;
      else balancete[l.conta].debito += l.valor;
    }
    const balanceteArr = Object.values(balancete).map(b => ({
      ...b,
      saldo: b.grupo === "RECEITA" ? b.credito : b.debito,
    })).sort((a, b) => a.conta.localeCompare(b.conta));

    // ═══ TOTAIS POR GRUPO ═══
    const porGrupo: Record<string, number> = {};
    for (const b of balanceteArr) {
      porGrupo[b.grupo] = (porGrupo[b.grupo] || 0) + b.saldo;
    }

    // ═══ TOTAIS POR TIPO DE CONTA (Controlling view) ═══
    const porTipo: Record<string, { receita: number; despesa: number }> = {};
    for (const l of ledger) {
      if (!porTipo[l.tipoConta]) porTipo[l.tipoConta] = { receita: 0, despesa: 0 };
      if (l.tipo === "RECEITA") porTipo[l.tipoConta].receita += l.valor;
      else porTipo[l.tipoConta].despesa += l.valor;
    }

    return NextResponse.json({
      success: true,
      data: {
        planoContas: Object.entries(PLANO_CONTAS).map(([id, info]) => ({ id, ...info })),
        balancete: balanceteArr,
        porGrupo,
        porTipo: Object.entries(porTipo).map(([tipo, v]) => ({ tipo, ...v, resultado: v.receita - v.despesa })),
        totalLancamentos: ledger.length,
        ledger: ledger.slice(0, 300),
      },
    });
  } catch (error) {
    console.error("GET /api/financeiro/razao error:", error);
    return NextResponse.json({ success: false, error: "Erro no razão contábil" }, { status: 500 });
  }
}
