import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "financeiro";
  const tenantId = session.tenantId;

  // Fetch data based on type
  let title = "Relatório";
  let rows: { label: string; value: string }[] = [];

  if (type === "financeiro") {
    title = "Relatório Financeiro";
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [receitas, despesas, pendentes] = await Promise.all([
      prisma.movimentacaoFinanceira.aggregate({
        where: { ...(tenantId ? { tenantId } : {}), tipo: "RECEITA", status: "PAGO", createdAt: { gte: firstOfMonth } },
        _sum: { valor: true },
      }),
      prisma.movimentacaoFinanceira.aggregate({
        where: { ...(tenantId ? { tenantId } : {}), tipo: "DESPESA", status: "PAGO", createdAt: { gte: firstOfMonth } },
        _sum: { valor: true },
      }),
      prisma.movimentacaoFinanceira.count({
        where: { ...(tenantId ? { tenantId } : {}), status: "PENDENTE" },
      }),
    ]);

    rows = [
      { label: "Receitas do mês", value: `R$ ${(Number(receitas._sum.valor) || 0).toFixed(2)}` },
      { label: "Despesas do mês", value: `R$ ${(Number(despesas._sum.valor) || 0).toFixed(2)}` },
      { label: "Resultado", value: `R$ ${((Number(receitas._sum.valor) || 0) - (Number(despesas._sum.valor) || 0)).toFixed(2)}` },
      { label: "Pendentes", value: String(pendentes) },
    ];
  } else if (type === "ocupacao") {
    title = "Relatório de Ocupação";
    const quartos = await prisma.quarto.findMany({
      where: tenantId ? { tenantId } : {},
      include: { pacientes: { where: { status: "ATIVO", deletedAt: null }, select: { id: true } } },
    });
    const total = quartos.length;
    const ocupados = quartos.filter((q) => q.pacientes.length > 0).length;
    rows = [
      { label: "Total de quartos", value: String(total) },
      { label: "Ocupados", value: String(ocupados) },
      { label: "Disponíveis", value: String(total - ocupados) },
      { label: "Taxa de ocupação", value: `${total > 0 ? Math.round((ocupados / total) * 100) : 0}%` },
    ];
  } else if (type === "clinico") {
    title = "Relatório Clínico";
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const [evolucoes, prescricoes, pacientes] = await Promise.all([
      prisma.evolucao.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.prescricao.count({ where: { ativa: true } }),
      prisma.paciente.count({ where: { ...(tenantId ? { tenantId } : {}), status: "ATIVO", deletedAt: null } }),
    ]);
    rows = [
      { label: "Evoluções (30 dias)", value: String(evolucoes) },
      { label: "Prescrições ativas", value: String(prescricoes) },
      { label: "Pacientes ativos", value: String(pacientes) },
    ];
  }

  // Generate print-ready HTML
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${title} — Hachi Platform</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; margin: 0; padding: 40px; }
    h1 { color: #0D9488; font-size: 24px; border-bottom: 2px solid #0D9488; padding-bottom: 8px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #0D9488; color: #fff; padding: 10px 12px; text-align: left; font-size: 13px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    tr:nth-child(even) td { background: #f0fdfa; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #999; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Gerado em ${new Date().toLocaleString("pt-BR")} · Hachi Platform</p>
  <table>
    <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r.label}</td><td><strong>${r.value}</strong></td></tr>`).join("")}</tbody>
  </table>
  <p class="footer">Hachi Platform — Business Operating System · Documento gerado automaticamente</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
