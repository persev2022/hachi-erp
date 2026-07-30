import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * POST /api/ia/chat
 * AI assistant that answers questions about the business using real data.
 * Uses OpenAI API — requires OPENAI_API_KEY env var or stored in SystemConfig.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Tenant não configurado" }, { status: 400 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Mensagem é obrigatória" }, { status: 400 });
    }

    // Get API key
    let apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      const config = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
      if (config) {
        try { const s = JSON.parse(config.value); apiKey = s.openai?.apiKey || ""; } catch {}
      }
    }

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: { response: "⚠️ Chave da OpenAI não configurada. Vá em Configurações → Integrações e insira sua chave da API OpenAI para ativar o assistente de IA." },
      });
    }

    // Gather context data for the AI
    const tf = { tenantId };
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pacientesAtivos, receitaMes, despesaMes, inadimplentes, evolucoesMes, ocupacao] = await Promise.all([
      prisma.paciente.count({ where: { ...tf, status: "ATIVO", deletedAt: null } }),
      prisma.movimentacaoFinanceira.aggregate({ where: { ...tf, tipo: "RECEITA", status: "PAGO", dataPagamento: { gte: firstOfMonth } }, _sum: { valor: true } }),
      prisma.movimentacaoFinanceira.aggregate({ where: { ...tf, tipo: "DESPESA", dataVencimento: { gte: firstOfMonth } }, _sum: { valor: true } }),
      prisma.movimentacaoFinanceira.count({ where: { ...tf, tipo: "RECEITA", status: "ATRASADO" } }),
      prisma.evolucao.count({ where: { paciente: { tenantId }, createdAt: { gte: firstOfMonth } } }),
      prisma.quarto.findMany({ where: tf, select: { status: true } }),
    ]);

    const totalQuartos = ocupacao.length;
    const quartosOcupados = ocupacao.filter((q) => q.status === "OCUPADO").length;

    const systemContext = `Você é o assistente de IA do Hachi ERP. Responda em português brasileiro de forma concisa e profissional.
Dados atuais do sistema:
- Pacientes/acolhidos ativos: ${pacientesAtivos}
- Receita do mês: R$ ${(receitaMes._sum.valor || 0).toFixed(2)}
- Despesas do mês: R$ ${(despesaMes._sum.valor || 0).toFixed(2)}
- Resultado: R$ ${((receitaMes._sum.valor || 0) - (despesaMes._sum.valor || 0)).toFixed(2)}
- Inadimplentes: ${inadimplentes} parcelas atrasadas
- Evoluções registradas no mês: ${evolucoesMes}
- Quartos: ${quartosOcupados}/${totalQuartos} ocupados (${totalQuartos > 0 ? Math.round((quartosOcupados / totalQuartos) * 100) : 0}%)
- Data atual: ${now.toLocaleDateString("pt-BR")}

Se perguntarem sobre previsão, use os dados para projetar. Se perguntarem algo fora do escopo, diga que só responde sobre dados do sistema.`;

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return NextResponse.json({ success: true, data: { response: "Erro ao consultar a IA. Verifique a chave da API." } });
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content || "Sem resposta";

    return NextResponse.json({ success: true, data: { response: aiResponse } });
  } catch (error) {
    console.error("POST /api/ia/chat error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
