import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * POST /api/financeiro/gerar-mensalidades
 * Auto-generates monthly mensalidades for all active patients in the current month.
 * Skips patients that already have a mensalidade generated for the target month.
 * 
 * Body (optional):
 * - mes: "2026-08" format (defaults to current month)
 * 
 * This should be called:
 * - Manually by admin when needed
 * - Via cron job (future: Vercel Cron or external)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    if (!["ADMIN", "FINANCEIRO"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Tenant não identificado" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const targetMonth = body.mes || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [year, month] = targetMonth.split("-").map(Number);

    // Get all active patients with mensalidadeValor configured
    const pacientes = await prisma.paciente.findMany({
      where: {
        tenantId,
        status: "ATIVO",
        deletedAt: null,
        mensalidadeValor: { gt: 0 },
      },
      select: {
        id: true,
        nome: true,
        mensalidadeValor: true,
        diaVencimento: true,
      },
    });

    if (pacientes.length === 0) {
      return NextResponse.json({ success: true, message: "Nenhum paciente ativo com mensalidade configurada.", geradas: 0 });
    }

    // Check which patients already have mensalidade for this month
    const inicioMes = new Date(year, month - 1, 1);
    const fimMes = new Date(year, month, 0, 23, 59, 59);

    const existentes = await prisma.movimentacaoFinanceira.findMany({
      where: {
        tenantId,
        categoria: "MENSALIDADE",
        tipo: "RECEITA",
        dataVencimento: { gte: inicioMes, lte: fimMes },
      },
      select: { pacienteId: true },
    });

    const jaGerados = new Set(existentes.map(m => m.pacienteId));

    // Generate mensalidades for those who don't have one yet
    const paraGerar = pacientes.filter(p => !jaGerados.has(p.id));

    if (paraGerar.length === 0) {
      return NextResponse.json({
        success: true,
        message: `Todas as mensalidades de ${targetMonth} já foram geradas.`,
        geradas: 0,
        jaExistiam: existentes.length,
      });
    }

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const mesNome = meses[month - 1];

    const created = await prisma.movimentacaoFinanceira.createMany({
      data: paraGerar.map(p => {
        const diaVenc = p.diaVencimento || 5;
        // Ensure day doesn't exceed month's last day
        const lastDay = new Date(year, month, 0).getDate();
        const dia = Math.min(diaVenc, lastDay);

        return {
          pacienteId: p.id,
          tipo: "RECEITA" as const,
          categoria: "MENSALIDADE" as const,
          descricao: `Mensalidade ${mesNome}/${year} - ${p.nome}`,
          valor: p.mensalidadeValor!,
          dataVencimento: new Date(Date.UTC(year, month - 1, dia, 12, 0, 0)),
          status: "PENDENTE" as const,
          tenantId,
        };
      }),
    });

    return NextResponse.json({
      success: true,
      message: `${created.count} mensalidade(s) gerada(s) para ${mesNome}/${year}.`,
      geradas: created.count,
      jaExistiam: existentes.length,
      total: pacientes.length,
      detalhes: paraGerar.map(p => ({ nome: p.nome, valor: p.mensalidadeValor })),
    });
  } catch (error) {
    console.error("POST /api/financeiro/gerar-mensalidades error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar mensalidades" }, { status: 500 });
  }
}
