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
  const tf = tenantId ? { tenantId } : {};

  let html = "";

  if (type === "financeiro") {
    html = await generateFinanceiro(tf, tenantId);
  } else if (type === "ocupacao") {
    html = await generateOcupacao(tf, tenantId);
  } else if (type === "clinico") {
    html = await generateClinico(tf, tenantId);
  } else if (type === "evolucoes") {
    html = await generateEvolucoes(tf, tenantId, searchParams.get("pacienteId"));
  } else {
    html = wrapHtml("Relatório", "<p>Tipo não reconhecido</p>");
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function generateFinanceiro(tf: any, tenantId: string | null) {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [receitasMes, despesasMes, receitasLastMonth, despesasLastMonth, pendentes, atrasados, movRecentes] = await Promise.all([
    prisma.movimentacaoFinanceira.aggregate({ where: { ...tf, tipo: "RECEITA", status: "PAGO", dataPagamento: { gte: firstOfMonth } }, _sum: { valor: true }, _count: true }),
    prisma.movimentacaoFinanceira.aggregate({ where: { ...tf, tipo: "DESPESA", status: "PAGO", dataPagamento: { gte: firstOfMonth } }, _sum: { valor: true }, _count: true }),
    prisma.movimentacaoFinanceira.aggregate({ where: { ...tf, tipo: "RECEITA", status: "PAGO", dataPagamento: { gte: lastMonth, lte: lastMonthEnd } }, _sum: { valor: true } }),
    prisma.movimentacaoFinanceira.aggregate({ where: { ...tf, tipo: "DESPESA", status: "PAGO", dataPagamento: { gte: lastMonth, lte: lastMonthEnd } }, _sum: { valor: true } }),
    prisma.movimentacaoFinanceira.count({ where: { ...tf, status: "PENDENTE" } }),
    prisma.movimentacaoFinanceira.aggregate({ where: { ...tf, status: "ATRASADO", tipo: "RECEITA" }, _sum: { valor: true }, _count: true }),
    prisma.movimentacaoFinanceira.findMany({ where: tf, orderBy: { createdAt: "desc" }, take: 10, include: { paciente: { select: { nome: true } } } }),
  ]);

  const rec = receitasMes._sum.valor || 0;
  const desp = despesasMes._sum.valor || 0;
  const resultado = rec - desp;
  const recLast = receitasLastMonth._sum.valor || 0;
  const variacao = recLast > 0 ? Math.round(((rec - recLast) / recLast) * 100) : 0;

  const content = `
    <div class="kpis">
      <div class="kpi green"><div class="kpi-value">R$ ${rec.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><div class="kpi-label">Receitas do Mês</div></div>
      <div class="kpi red"><div class="kpi-value">R$ ${desp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><div class="kpi-label">Despesas do Mês</div></div>
      <div class="kpi ${resultado >= 0 ? "green" : "red"}"><div class="kpi-value">R$ ${resultado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><div class="kpi-label">Resultado</div></div>
      <div class="kpi yellow"><div class="kpi-value">${pendentes}</div><div class="kpi-label">Pendentes</div></div>
    </div>

    <div class="section">
      <h2>Indicadores</h2>
      <table>
        <tr><td>Variação vs mês anterior</td><td><strong>${variacao > 0 ? "+" : ""}${variacao}%</strong></td></tr>
        <tr><td>Inadimplência total</td><td><strong>R$ ${(atrasados._sum.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${atrasados._count} parcelas)</strong></td></tr>
        <tr><td>Receitas recebidas (qtd)</td><td><strong>${receitasMes._count}</strong></td></tr>
        <tr><td>Margem operacional</td><td><strong>${rec > 0 ? Math.round(((rec - desp) / rec) * 100) : 0}%</strong></td></tr>
      </table>
    </div>

    <div class="section">
      <h2>Últimas Movimentações</h2>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Paciente</th><th>Tipo</th><th>Valor</th><th>Status</th></tr></thead>
        <tbody>
          ${movRecentes.map((m) => `<tr>
            <td>${new Date(m.dataVencimento).toLocaleDateString("pt-BR")}</td>
            <td>${m.descricao}</td>
            <td>${m.paciente?.nome || "—"}</td>
            <td><span class="badge ${m.tipo === "RECEITA" ? "badge-green" : "badge-red"}">${m.tipo}</span></td>
            <td><strong>R$ ${m.valor.toFixed(2)}</strong></td>
            <td><span class="badge badge-${m.status === "PAGO" ? "green" : m.status === "ATRASADO" ? "red" : "yellow"}">${m.status}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  return wrapHtml("Relatório Financeiro", content);
}

async function generateOcupacao(tf: any, tenantId: string | null) {
  const quartos = await prisma.quarto.findMany({
    where: tenantId ? { tenantId } : {},
    include: { pacientes: { where: { status: "ATIVO", deletedAt: null }, select: { id: true, nome: true } } },
    orderBy: { numero: "asc" },
  });

  const total = quartos.length;
  const ocupados = quartos.filter((q) => q.pacientes.length > 0).length;
  const taxa = total > 0 ? Math.round((ocupados / total) * 100) : 0;
  const pacientesAtivos = await prisma.paciente.count({ where: { ...tf, status: "ATIVO", deletedAt: null } });

  const content = `
    <div class="kpis">
      <div class="kpi blue"><div class="kpi-value">${total}</div><div class="kpi-label">Total Quartos</div></div>
      <div class="kpi green"><div class="kpi-value">${ocupados}</div><div class="kpi-label">Ocupados</div></div>
      <div class="kpi yellow"><div class="kpi-value">${total - ocupados}</div><div class="kpi-label">Disponíveis</div></div>
      <div class="kpi teal"><div class="kpi-value">${taxa}%</div><div class="kpi-label">Taxa Ocupação</div></div>
    </div>

    <div class="section">
      <h2>Detalhamento por Quarto</h2>
      <table>
        <thead><tr><th>Quarto</th><th>Andar</th><th>Capacidade</th><th>Ocupantes</th><th>Status</th></tr></thead>
        <tbody>
          ${quartos.map((q) => `<tr>
            <td><strong>${q.numero}</strong></td>
            <td>${q.andar}º</td>
            <td>${q.capacidade}</td>
            <td>${q.pacientes.length > 0 ? q.pacientes.map((p) => p.nome.split(" ")[0]).join(", ") : "—"}</td>
            <td><span class="badge badge-${q.pacientes.length > 0 ? "green" : q.status === "MANUTENCAO" ? "yellow" : "blue"}">${q.pacientes.length > 0 ? "OCUPADO" : q.status}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Resumo</h2>
      <table>
        <tr><td>Pacientes ativos</td><td><strong>${pacientesAtivos}</strong></td></tr>
        <tr><td>Vagas disponíveis</td><td><strong>${quartos.reduce((s, q) => s + q.capacidade, 0) - pacientesAtivos}</strong></td></tr>
      </table>
    </div>`;

  return wrapHtml("Relatório de Ocupação", content);
}

async function generateClinico(tf: any, tenantId: string | null) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const evolWhere: any = { createdAt: { gte: thirtyDaysAgo } };
  const prescWhere: any = { ativa: true };
  if (tenantId) { evolWhere.paciente = { tenantId }; prescWhere.paciente = { tenantId }; }

  const [evolucoes, evolByTipo, prescricoes, pacientes, naoAssinadas] = await Promise.all([
    prisma.evolucao.count({ where: evolWhere }),
    prisma.evolucao.groupBy({ by: ["tipo"], where: evolWhere, _count: true }),
    prisma.prescricao.count({ where: prescWhere }),
    prisma.paciente.count({ where: { ...(tenantId ? { tenantId } : {}), status: "ATIVO", deletedAt: null } }),
    prisma.evolucao.count({ where: { ...evolWhere, assinado: false } }),
  ]);

  const content = `
    <div class="kpis">
      <div class="kpi teal"><div class="kpi-value">${pacientes}</div><div class="kpi-label">Pacientes Ativos</div></div>
      <div class="kpi blue"><div class="kpi-value">${evolucoes}</div><div class="kpi-label">Evoluções (30d)</div></div>
      <div class="kpi green"><div class="kpi-value">${prescricoes}</div><div class="kpi-label">Prescrições Ativas</div></div>
      <div class="kpi ${naoAssinadas > 0 ? "yellow" : "green"}"><div class="kpi-value">${naoAssinadas}</div><div class="kpi-label">Não Assinadas</div></div>
    </div>

    <div class="section">
      <h2>Evoluções por Tipo (últimos 30 dias)</h2>
      <table>
        <thead><tr><th>Tipo</th><th>Quantidade</th><th>Proporção</th></tr></thead>
        <tbody>
          ${evolByTipo.map((e) => `<tr>
            <td><strong>${e.tipo}</strong></td>
            <td>${e._count}</td>
            <td><div class="bar" style="width: ${evolucoes > 0 ? (e._count / evolucoes) * 100 : 0}%"></div> ${evolucoes > 0 ? Math.round((e._count / evolucoes) * 100) : 0}%</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Indicadores de Qualidade</h2>
      <table>
        <tr><td>Média evoluções/paciente (30d)</td><td><strong>${pacientes > 0 ? (evolucoes / pacientes).toFixed(1) : 0}</strong></td></tr>
        <tr><td>Taxa de assinatura</td><td><strong>${evolucoes > 0 ? Math.round(((evolucoes - naoAssinadas) / evolucoes) * 100) : 0}%</strong></td></tr>
        <tr><td>Prescrições/paciente</td><td><strong>${pacientes > 0 ? (prescricoes / pacientes).toFixed(1) : 0}</strong></td></tr>
      </table>
    </div>`;

  return wrapHtml("Relatório Clínico", content);
}

async function generateEvolucoes(tf: any, tenantId: string | null, pacienteId: string | null) {
  const where: any = {};
  if (tenantId) where.paciente = { tenantId };
  if (pacienteId) where.pacienteId = pacienteId;

  const evolucoes = await prisma.evolucao.findMany({
    where,
    include: {
      paciente: { select: { nome: true } },
      profissional: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const byTipo = evolucoes.reduce((acc: Record<string, number>, e) => {
    acc[e.tipo] = (acc[e.tipo] || 0) + 1;
    return acc;
  }, {});

  const tipoLabels: Record<string, string> = {
    MEDICA: "Médica", PSICOLOGICA: "Psicológica", ENFERMAGEM: "Enfermagem",
    TERAPEUTICA: "Terapêutica", SOCIAL: "Social", NUTRICIONAL: "Nutricional",
  };

  const pacienteNome = pacienteId && evolucoes.length > 0 ? evolucoes[0].paciente.nome : "Todos os pacientes";
  const assinadas = evolucoes.filter((e) => e.assinado).length;

  const content = `
    <div class="kpis">
      <div class="kpi teal"><div class="kpi-value">${evolucoes.length}</div><div class="kpi-label">Total Evoluções</div></div>
      <div class="kpi green"><div class="kpi-value">${assinadas}</div><div class="kpi-label">Assinadas</div></div>
      <div class="kpi yellow"><div class="kpi-value">${evolucoes.length - assinadas}</div><div class="kpi-label">Pendentes Assinatura</div></div>
      <div class="kpi blue"><div class="kpi-value">${Object.keys(byTipo).length}</div><div class="kpi-label">Tipos Diferentes</div></div>
    </div>

    <div class="section">
      <h2>Distribuição por Tipo</h2>
      <table>
        <thead><tr><th>Tipo</th><th>Quantidade</th><th>Proporção</th></tr></thead>
        <tbody>
          ${Object.entries(byTipo).map(([tipo, count]) => `<tr>
            <td><strong>${tipoLabels[tipo] || tipo}</strong></td>
            <td>${count}</td>
            <td><div class="bar" style="width: ${(count as number / evolucoes.length) * 100}%"></div> ${Math.round((count as number / evolucoes.length) * 100)}%</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Registro Detalhado${pacienteId ? ` — ${pacienteNome}` : ""}</h2>
      <table>
        <thead><tr><th>Data</th><th>Paciente</th><th>Tipo</th><th>Profissional</th><th>Conteúdo</th><th>Status</th></tr></thead>
        <tbody>
          ${evolucoes.map((e) => `<tr>
            <td style="white-space:nowrap">${new Date(e.createdAt).toLocaleDateString("pt-BR")}</td>
            <td>${e.paciente.nome.split(" ").slice(0, 2).join(" ")}</td>
            <td><span class="badge badge-teal">${tipoLabels[e.tipo] || e.tipo}</span></td>
            <td>${e.profissional.name}</td>
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${e.conteudo.slice(0, 120)}${e.conteudo.length > 120 ? "..." : ""}</td>
            <td>${e.assinado ? '<span class="badge badge-green">Assinada</span>' : '<span class="badge badge-yellow">Pendente</span>'}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  return wrapHtml(`Relatório de Evoluções${pacienteId ? ` — ${pacienteNome}` : ""}`, content);
}

function wrapHtml(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${title} — Hachi Platform</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; max-width: 900px; margin: 0 auto; line-height: 1.5; }
    h1 { color: #0D9488; font-size: 26px; font-weight: 700; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 12px; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #f3f4f6; }
    h2 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    .section { margin-bottom: 32px; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
    .kpi { padding: 16px; border-radius: 12px; text-align: center; }
    .kpi-value { font-size: 22px; font-weight: 700; }
    .kpi-label { font-size: 11px; margin-top: 4px; opacity: 0.8; font-weight: 500; }
    .kpi.green { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .kpi.red { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .kpi.yellow { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .kpi.blue { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .kpi.teal { background: #f0fdfa; color: #0f766e; border: 1px solid #99f6e4; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { background: #f9fafb; color: #374151; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tr:hover td { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-teal { background: #ccfbf1; color: #0f766e; }
    .bar { display: inline-block; height: 8px; background: #0D9488; border-radius: 4px; min-width: 4px; vertical-align: middle; margin-right: 8px; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 0; } .kpis { break-inside: avoid; } }
    @media (max-width: 600px) { .kpis { grid-template-columns: repeat(2, 1fr); } }
  </style>
</head>
<body>
  <h1>📊 ${title}</h1>
  <p class="meta">Gerado em ${new Date().toLocaleString("pt-BR")} · Hachi Platform</p>
  ${content}
  <div class="footer">Hachi Platform — Business Operating System · Documento gerado automaticamente · Confidencial</div>
</body>
</html>`;
}
