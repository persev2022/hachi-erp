import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/financeiro/drill
 * SAP-level drill-down: returns the individual transactions that compose any
 * aggregate the user clicks on.
 *
 * Query params:
 * - dimensao: "centroCusto" | "categoria" | "mes" | "pagador" | "credor" | "metodo" | "tipo" | "status"
 * - valor: the specific value to filter (e.g. "Alimentação & Suprimentos", "2026-05", "Pix")
 * - tipo: optional RECEITA|DESPESA filter
 */

function classifyCostCenter(descricao: string, categoria: string): string {
  const d = descricao.toUpperCase();
  if (d.includes("KOMPRAO") || d.includes("SUPERMERCADO") || d.includes("MERCADO") || d.includes("BUFFON") || d.includes("MANENTTI") || d.includes("AGROROSA") || categoria === "ALIMENTACAO") return "Alimentação & Suprimentos";
  if (d.includes("POSTO") || d.includes("AUTOPISTA") || d.includes("SEM PARAR") || d.includes("VIA FACIL") || categoria === "TRANSPORTE") return "Transporte & Combustível";
  if (d.includes("LIQUIDACAO") || d.includes("JUROS") || d.includes("IOF") || d.includes("PARCELA")) return "Financeiro (Parcelas/Juros)";
  if (d.includes("PAGAMENTO PIX") && !d.includes("GAS") && !d.includes("ELETRO")) return "Pessoal (Pagamentos)";
  if (d.includes("VIVO") || d.includes("NETFLIX") || d.includes("JOBWAY")) return "Telecomunicações";
  if (d.includes("MAPFRE") || d.includes("VIDA SEGURADORA") || d.includes("CONSORCIO")) return "Seguros & Convênios";
  if (d.includes("TARIFA") || d.includes("CUSTAS") || d.includes("CESTA") || d.includes("PROTESTO")) return "Taxas & Tarifas Bancárias";
  if (d.includes("ELETRO") || d.includes("MABEL") || d.includes("MULTI")) return "Serviços & Manutenção";
  return "Outros";
}

function extractName(desc: string): string {
  // IMPORTANTE: lógica IDÊNTICA à do analise-profunda (+ slice 40 como o caller de lá faz),
  // senão o drill não reconcilia com os agregados (pagador/credor).
  let nome: string;
  if (desc.includes("PIX")) {
    const parts = desc.replace(/RECEBIMENTO PIX|PAGAMENTO PIX/gi, "").trim();
    const n = parts.replace(/^\d{11,14}\s*/, "").replace(/^PIX_\w+\s*/, "").trim();
    nome = n.length < 3 ? parts.trim() : n;
  } else if (desc.includes("COMPRAS NACIONAIS")) {
    nome = desc.replace("COMPRAS NACIONAIS", "").trim().split(" ").slice(0, 2).join(" ");
  } else if (desc.includes("DEBITO CONVENIOS")) {
    nome = desc.replace(/DEBITO CONVENIOS \d+/, "").trim().split(" ").slice(0, 3).join(" ");
  } else if (desc.includes("LIQUIDACAO")) {
    nome = "Parcela/Financiamento";
  } else {
    nome = desc.slice(0, 30);
  }
  return nome.slice(0, 40);
}

// Maps a movement to an accounting account (same logic as /razao)
function mapearConta(tipo: string, categoria: string, descricao: string): string {
  const d = descricao.toUpperCase();
  if (tipo === "RECEITA") {
    if (categoria === "MATRICULA") return "3.1.2";
    if (categoria === "MENSALIDADE") return "3.1.1";
    if (d.match(/FMS|SUS|FUNDO MUNICIPAL|PREFEITURA|CUSTEIO/)) return "3.1.9";
    if (d.match(/RESG.APLIC|RENDIMENTO|APLIC.FIN/)) return "3.2.1";
    return "3.9.9";
  }
  if (categoria === "ALIMENTACAO" || d.match(/KOMPRAO|SUPERMERCADO|MANENTTI|AGROROSA|MERCADO/)) return "4.1.1";
  if (categoria === "MEDICAMENTO" || d.match(/FARMACIA|DROGARIA|MEDICAMENTO|SAUDE MANTAL|SAUDE MENTAL/)) return "4.1.2";
  if (categoria === "LAVANDERIA") return "4.1.3";
  if (d.match(/POSTO|AUTOPISTA|SEM PARAR|VIA FACIL|COMBUSTIVEL/) || categoria === "TRANSPORTE") return "4.2.2";
  if (d.match(/VIVO|NETFLIX|JOBWAY|TELEFON|INTERNET/)) return "4.2.3";
  if (d.match(/MAPFRE|SEGURADORA|CONSORCIO/)) return "4.2.5";
  if (d.match(/TARIFA|CUSTAS|CESTA|PROTESTO|IOF|JUROS/)) return "4.3.1";
  if (d.match(/DARF|DAS |ARRECADACAO|IMPOSTO|TRIBUTO|INSS|FGTS/)) return "4.3.2";
  if (d.match(/ELETRO|MABEL|MULTI|MANUTENCAO|CONSTRUCAO|TINTAS|FIGUEIREDO/)) return "4.2.4";
  if (d.includes("PAGAMENTO PIX")) return "4.2.1";
  if (d.match(/LIQUIDACAO|PARCELA|FINANCIAMENTO/)) return "4.3.1";
  return "4.9.9";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "FINANCEIRO", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: true, data: { transacoes: [], resumo: {} } });

    const { searchParams } = new URL(req.url);
    const dimensao = searchParams.get("dimensao") || "";
    const valor = searchParams.get("valor") || "";
    const tipoFiltro = searchParams.get("tipo");

    const where: any = { tenantId };
    if (tipoFiltro) where.tipo = tipoFiltro;

    const movs = await prisma.movimentacaoFinanceira.findMany({
      where,
      include: { paciente: { select: { nome: true } } },
      orderBy: { dataVencimento: "desc" },
    });

    // Filter by dimension
    let filtered = movs;
    switch (dimensao) {
      case "centroCusto":
        filtered = movs.filter(m => m.tipo === "DESPESA" && classifyCostCenter(m.descricao, m.categoria) === valor);
        break;
      case "categoria":
        filtered = movs.filter(m => m.categoria === valor);
        break;
      case "mes":
        filtered = movs.filter(m => m.dataVencimento.toISOString().slice(0, 7) === valor);
        break;
      case "pagador":
        filtered = movs.filter(m => m.tipo === "RECEITA" && extractName(m.descricao) === valor);
        break;
      case "credor":
        filtered = movs.filter(m => m.tipo === "DESPESA" && extractName(m.descricao) === valor);
        break;
      case "metodo":
        filtered = movs.filter(m => (m.formaPagamento || "Não identificado") === valor);
        break;
      case "status":
        filtered = movs.filter(m => m.status === valor);
        break;
      case "tipo":
        filtered = movs.filter(m => m.tipo === valor);
        break;
      case "conta":
        filtered = movs.filter(m => mapearConta(m.tipo, m.categoria, m.descricao) === valor);
        break;
      case "metodoPagamento":
        filtered = movs.filter(m => (m.formaPagamento || "Não identificado") === valor);
        break;
      case "aging": {
        // valor = "corrente" | "30" | "60" | "90" | "90plus"
        const nowD = new Date();
        filtered = movs.filter(m => {
          if (m.tipo !== "RECEITA") return false;
          const isPend = m.status === "PENDENTE" || m.status === "ATRASADO";
          if (!isPend) return false;
          const venc = new Date(m.dataVencimento);
          const dias = Math.floor((nowD.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24));
          // Buckets alinhados com analise-profunda (vencido30 = dias <= 30, inclusive)
          if (valor === "corrente") return venc >= nowD;
          if (valor === "30") return venc < nowD && dias <= 30;
          if (valor === "60") return dias > 30 && dias <= 60;
          if (valor === "90") return dias > 60 && dias <= 90;
          if (valor === "90plus") return dias > 90;
          return false;
        });
        break;
      }
      case "recorrente":
        filtered = movs.filter(m => m.descricao.slice(0, 30).toUpperCase() === valor.toUpperCase());
        break;
      default:
        filtered = movs;
    }

    const totalRec = filtered.filter(m => m.tipo === "RECEITA").reduce((s, m) => s + m.valor, 0);
    const totalDesp = filtered.filter(m => m.tipo === "DESPESA").reduce((s, m) => s + m.valor, 0);

    // Sub-breakdown: within this drill, group by month for a mini-trend
    const porMes: Record<string, number> = {};
    for (const m of filtered) {
      const key = m.dataVencimento.toISOString().slice(0, 7);
      porMes[key] = (porMes[key] || 0) + m.valor;
    }
    const tendencia = Object.entries(porMes).map(([mes, v]) => ({ mes, valor: Math.round(v) })).sort((a, b) => a.mes.localeCompare(b.mes));

    return NextResponse.json({
      success: true,
      data: {
        dimensao,
        valor,
        resumo: {
          count: filtered.length,
          totalReceitas: totalRec,
          totalDespesas: totalDesp,
          resultado: totalRec - totalDesp,
          ticketMedio: filtered.length > 0 ? (totalRec + totalDesp) / filtered.length : 0,
          // reduce em vez de Math.max(...spread) para não estourar o stack em drills grandes
          maiorTransacao: filtered.reduce((max, m) => m.valor > max ? m.valor : max, 0),
        },
        tendencia,
        transacoes: filtered.slice(0, 200).map(m => ({
          id: m.id,
          data: m.dataVencimento.toISOString().slice(0, 10),
          descricao: m.descricao,
          valor: m.valor,
          tipo: m.tipo,
          categoria: m.categoria,
          status: m.status,
          formaPagamento: m.formaPagamento,
          paciente: m.paciente?.nome || null,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/financeiro/drill error:", error);
    return NextResponse.json({ success: false, error: "Erro no drill-down" }, { status: 500 });
  }
}
