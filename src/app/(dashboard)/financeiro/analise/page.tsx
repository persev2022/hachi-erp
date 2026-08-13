"use client";

import * as React from "react";
import {
  Loader2, TrendingUp, TrendingDown, Building, CreditCard,
  Activity, Shield, AlertTriangle, BarChart3, Target, Clock,
  Flame, Repeat, ArrowUpRight, ArrowDownRight, Zap,
  Scissors, Users, Brain, LineChart, PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AnaliseProfundaPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"overview" | "dre" | "projecao" | "inadimplencia" | "custos">("overview");

  React.useEffect(() => {
    fetch("/api/financeiro/analise-profunda")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Processando análise financeira enterprise...</p>
    </div>
  );

  if (!data) return (
    <div className="p-8 text-center">
      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-muted-foreground">Sem dados financeiros para análise.</p>
    </div>
  );

  const {
    resumo, topPagadores, topCredores, centrosCusto,
    fluxoSemanal, metodosPagamento, dre, burnRate,
    pontoEquilibrio, comparativoMensal, anomalias, recorrentes,
    aging, indices, projecaoReceita, fluxoProjetado,
    cohortAnalysis, inadimplencia, sugestoes, alertas
  } = data;

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const fmtK = (v: number) => v >= 10000 ? `R$ ${(v / 1000).toFixed(1)}k` : fmt(v);

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: PieChart },
    { id: "dre", label: "DRE & Índices", icon: BarChart3 },
    { id: "projecao", label: "Projeções", icon: LineChart },
    { id: "inadimplencia", label: "Inadimplência", icon: AlertTriangle },
    { id: "custos", label: "Custos & Cortes", icon: Scissors },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Análise Financeira Enterprise</h1>
          <p className="text-sm text-muted-foreground">
            CFO Intelligence · DRE · Projeções IA · Aging · Cohort · Alertas Preditivos
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/financeiro/dashboard">← Dashboard</Link>
        </Button>
      </div>

      {/* ALERTAS PREDITIVOS — always visible at top */}
      {alertas && alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a: any, i: number) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
              a.severidade === "critico" ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" :
              a.severidade === "alto" ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" :
              "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
            }`}>
              <Zap className={`h-4 w-4 mt-0.5 shrink-0 ${
                a.severidade === "critico" ? "text-red-600" :
                a.severidade === "alto" ? "text-amber-600" : "text-blue-600"
              }`} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{a.titulo}</p>
                <p className="text-xs text-muted-foreground">{a.descricao}</p>
              </div>
              <Badge variant={a.severidade === "critico" ? "destructive" : "outline"} className="text-[9px] shrink-0">
                {a.severidade.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              tab === t.id ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: OVERVIEW */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Health + Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card className={`${resumo.healthScore >= 70 ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : resumo.healthScore >= 40 ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
              <CardContent className="p-3 text-center">
                <Shield className={`h-5 w-5 mx-auto mb-1 ${resumo.healthScore >= 70 ? "text-emerald-600" : resumo.healthScore >= 40 ? "text-amber-600" : "text-red-600"}`} />
                <p className="text-2xl font-bold">{resumo.healthScore}</p>
                <p className="text-[9px] text-muted-foreground">SAÚDE</p>
              </CardContent>
            </Card>
            <MetricCard label="Receitas" value={fmtK(resumo.totalReceitas)} icon={ArrowUpRight} color="emerald" />
            <MetricCard label="Despesas" value={fmtK(resumo.totalDespesas)} icon={ArrowDownRight} color="red" />
            <MetricCard label="Margem" value={`${resumo.margem}%`} icon={TrendingUp} color={resumo.margem >= 0 ? "emerald" : "red"} />
            <MetricCard label="Concentração" value={`${resumo.concentracaoRisco}%`} icon={AlertTriangle} color={resumo.concentracaoRisco > 50 ? "amber" : "emerald"} />
            <MetricCard label="Pac. Ativos" value={`${resumo.pacientesAtivos}`} icon={Users} color="blue" />
          </div>

          {/* Burn Rate + Runway + Break-even */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {burnRate && (
              <Card className="border-orange-200/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" /> Burn Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="Gasto/mês" value={fmtK(burnRate.mensal)} color="red" />
                    <MiniStat label="Receita/mês" value={fmtK(burnRate.receitaMensal)} color="emerald" />
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <p className={`text-lg font-bold ${burnRate.burnLiquido > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {burnRate.burnLiquido > 0 ? "-" : "+"}{fmtK(Math.abs(burnRate.burnLiquido))}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Burn Líquido/mês</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {burnRate && (
              <Card className={`${burnRate.runwayDias < 90 ? "border-red-200" : burnRate.runwayDias < 180 ? "border-amber-200" : "border-emerald-200"}`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Runway
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-center space-y-2">
                  {burnRate.runwayDias >= 999 ? (
                    <>
                      <p className="text-3xl font-bold text-emerald-600">∞</p>
                      <p className="text-xs text-emerald-600 font-medium">Sustentável</p>
                    </>
                  ) : (
                    <>
                      <p className={`text-3xl font-bold ${burnRate.runwayDias < 90 ? "text-red-600" : burnRate.runwayDias < 180 ? "text-amber-600" : "text-emerald-600"}`}>
                        {burnRate.runwayMeses}m
                      </p>
                      <p className="text-[10px] text-muted-foreground">{burnRate.runwayDias} dias</p>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${burnRate.runwayDias < 90 ? "bg-red-500" : burnRate.runwayDias < 180 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (burnRate.runwayDias / 365) * 100)}%` }} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {pontoEquilibrio && (
              <Card className="border-blue-200/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" /> Break-even
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{pontoEquilibrio.pacientesNecessarios}</p>
                    <p className="text-[10px] text-muted-foreground">pacientes necessários</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Ativos agora</span>
                    <Badge variant={pontoEquilibrio.deficit > 0 ? "destructive" : "default"} className="text-[9px]">
                      {pontoEquilibrio.pacientesAtivos} {pontoEquilibrio.deficit > 0 ? `(-${pontoEquilibrio.deficit})` : "✓"}
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (pontoEquilibrio.pacientesAtivos / (pontoEquilibrio.pacientesNecessarios || 1)) * 100)}%` }} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Aging + Indices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Aging de Recebíveis */}
            {aging && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" /> Aging de Recebíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <AgingBar label="A vencer" value={aging.corrente.valor} count={aging.corrente.count} total={aging.corrente.valor + aging.totalVencido} color="emerald" />
                    <AgingBar label="1-30 dias" value={aging.vencido30.valor} count={aging.vencido30.count} total={aging.corrente.valor + aging.totalVencido} color="amber" />
                    <AgingBar label="31-60 dias" value={aging.vencido60.valor} count={aging.vencido60.count} total={aging.corrente.valor + aging.totalVencido} color="orange" />
                    <AgingBar label="61-90 dias" value={aging.vencido90.valor} count={aging.vencido90.count} total={aging.corrente.valor + aging.totalVencido} color="red" />
                    <AgingBar label="90+ dias" value={aging.vencido90plus.valor} count={aging.vencido90plus.count} total={aging.corrente.valor + aging.totalVencido} color="red" />
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-xs font-medium">Total Vencido</span>
                      <span className="text-sm font-bold text-red-600">{fmt(aging.totalVencido)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Índices Financeiros */}
            {indices && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> Índices Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <IndexCard label="Liquidez Corrente" value={`${indices.liquidezCorrente}x`} good={indices.liquidezCorrente >= 1} />
                    <IndexCard label="EBITDA" value={fmtK(indices.ebitda)} good={indices.ebitda > 0} />
                    <IndexCard label="Margem EBITDA" value={`${indices.margemEbitda}%`} good={indices.margemEbitda > 15} />
                    <IndexCard label="ROA" value={`${indices.roa}%`} good={indices.roa > 5} />
                    <IndexCard label="DSO (Prazo Médio)" value={`${indices.cicloFinanceiro} dias`} good={indices.cicloFinanceiro < 30} />
                    <IndexCard label="A Receber" value={fmtK(indices.recebiveisTotal)} good={true} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comparativo Mensal */}
          {comparativoMensal && comparativoMensal.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Comparativo Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Mês</th>
                        <th className="p-2 text-right text-emerald-600">Receitas</th>
                        <th className="p-2 text-right text-red-600">Despesas</th>
                        <th className="p-2 text-right">Resultado</th>
                        <th className="p-2 text-right">Margem</th>
                        <th className="p-2 text-center">Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparativoMensal.map((m: any, i: number) => {
                        const prev = i > 0 ? comparativoMensal[i - 1] : null;
                        const variacao = prev && prev.receitas > 0 ? Math.round(((m.receitas - prev.receitas) / prev.receitas) * 100) : null;
                        return (
                          <tr key={m.mes} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-2 font-medium">{formatMonth(m.mes)}</td>
                            <td className="p-2 text-right text-emerald-600">{fmtK(m.receitas)}</td>
                            <td className="p-2 text-right text-red-600">{fmtK(m.despesas)}</td>
                            <td className={`p-2 text-right font-bold ${m.resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtK(m.resultado)}</td>
                            <td className="p-2 text-right"><Badge variant={m.margem >= 0 ? "default" : "destructive"} className="text-[9px]">{m.margem}%</Badge></td>
                            <td className="p-2 text-center">
                              {variacao !== null ? <span className={`text-[10px] font-medium ${variacao >= 0 ? "text-emerald-600" : "text-red-600"}`}>{variacao >= 0 ? "↑" : "↓"}{Math.abs(variacao)}%</span> : <span className="text-[10px] text-muted-foreground">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Pagadores & Credores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> Top Pagadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {topPagadores.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                        <div>
                          <p className="text-xs font-medium truncate max-w-[180px]">{p.nome}</p>
                          <p className="text-[9px] text-muted-foreground">{p.count}x · TM: {fmtK(p.ticketMedio)}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-emerald-600">{fmtK(p.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-600" /> Top Credores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {topCredores.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                        <div>
                          <p className="text-xs font-medium truncate max-w-[180px]">{c.nome}</p>
                          <p className="text-[9px] text-muted-foreground">{c.count}x · {c.categoria}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-red-600">{fmtK(c.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: DRE & ÍNDICES */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "dre" && dre && (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> DRE — Demonstrativo de Resultado
              </CardTitle>
              <CardDescription>Período: {resumo.diasAnalisados} dias · {resumo.transacoes} transações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <DRELine label="Receita Bruta" value={dre.receitaBruta} bold positive />
                <DRELine label="(-) Deduções" value={dre.deducoesReceita} indent negative />
                <DRELine label="= Receita Líquida" value={dre.receitaLiquida} bold highlight />
                <div className="border-t my-3" />
                <DRELine label="(-) Custos Diretos (CMV)" value={dre.custosDiretos} indent negative />
                <DRELine label="= Lucro Bruto" value={dre.lucroBruto} bold />
                <DREBadge label="Margem Bruta" value={`${dre.margemBruta}%`} good={dre.margemBruta > 30} />
                <div className="border-t my-3" />
                <DRELine label="(-) Despesas Operacionais" value={dre.despesasOperacionais} indent negative />
                <DRELine label="= EBIT (Lucro Operacional)" value={dre.lucroOperacional} bold positive={dre.lucroOperacional >= 0} negative={dre.lucroOperacional < 0} />
                <DREBadge label="Margem Operacional" value={`${dre.margemOperacional}%`} good={dre.margemOperacional > 10} />
                <div className="border-t my-3" />
                <DRELine label="(+) Depreciação/Amortização" value={0} indent />
                <DRELine label="= EBITDA" value={dre.ebitda} bold positive={dre.ebitda >= 0} negative={dre.ebitda < 0} highlight />
                <DREBadge label="Margem EBITDA" value={`${dre.margemEbitda}%`} good={dre.margemEbitda > 15} />
                <div className="border-t my-3" />
                <DRELine label="(-) Despesas Financeiras" value={dre.despesasFinanceiras} indent negative />
                <DRELine label="= Lucro Líquido" value={dre.lucroLiquido} bold positive={dre.lucroLiquido >= 0} negative={dre.lucroLiquido < 0} highlight />
                <DREBadge label="Margem Líquida" value={`${dre.margemLiquida}%`} good={dre.margemLiquida > 5} />
              </div>
            </CardContent>
          </Card>

          {/* Índices completos */}
          {indices && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> Indicadores de Performance (KPIs)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <IndexCardFull label="Liquidez Corrente" value={`${indices.liquidezCorrente}x`} description="Ativos / Passivos curto prazo" good={indices.liquidezCorrente >= 1} benchmark="> 1.0x" />
                  <IndexCardFull label="EBITDA" value={fmtK(indices.ebitda)} description="Lucro antes de juros, impostos, depreciação" good={indices.ebitda > 0} benchmark="> 0" />
                  <IndexCardFull label="Margem EBITDA" value={`${indices.margemEbitda}%`} description="EBITDA / Receita Líquida" good={indices.margemEbitda > 15} benchmark="> 15%" />
                  <IndexCardFull label="ROA" value={`${indices.roa}%`} description="Return on Assets" good={indices.roa > 5} benchmark="> 5%" />
                  <IndexCardFull label="DSO" value={`${indices.cicloFinanceiro} dias`} description="Days Sales Outstanding" good={indices.cicloFinanceiro < 30} benchmark="< 30 dias" />
                  <IndexCardFull label="Break-even" value={`${pontoEquilibrio?.pacientesNecessarios || 0} pac.`} description="Pacientes para cobrir custos" good={pontoEquilibrio?.deficit <= 0} benchmark="Ativos ≥ necessários" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métodos de Pagamento + Fluxo Semanal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> Métodos de Pagamento</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metodosPagamento.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{m.nome}</Badge>
                        <span className="text-[10px] text-muted-foreground">{m.count}x</span>
                      </div>
                      <p className="text-xs font-medium">{fmtK(m.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Repeat className="h-4 w-4" /> Transações Recorrentes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {recorrentes.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.tipo === "RECEITA" ? "default" : "destructive"} className="text-[8px] w-4 h-4 p-0 flex items-center justify-center">
                          {r.tipo === "RECEITA" ? "R" : "D"}
                        </Badge>
                        <p className="text-[10px] font-medium truncate max-w-[160px]">{r.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold">{r.frequencia}x</p>
                        <p className="text-[9px] text-muted-foreground">{fmtK(r.mediaPorOcorrencia)}/vez</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: PROJEÇÕES */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "projecao" && (
        <div className="space-y-6">
          {/* Projeção de Receita */}
          {projecaoReceita && projecaoReceita.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" /> Projeção de Receita (IA)
                </CardTitle>
                <CardDescription>Regressão linear + fator de sazonalidade · Próximos 3 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projecaoReceita.map((p: any) => (
                    <div key={p.mes} className="p-4 rounded-lg border bg-muted/20">
                      <p className="text-sm font-semibold text-center mb-3">{formatMonth(p.mes)}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-emerald-600">Otimista</span>
                          <span className="text-sm font-bold text-emerald-600">{fmtK(p.otimista)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                          <span className="text-xs font-medium text-primary">Realista</span>
                          <span className="text-sm font-bold text-primary">{fmtK(p.realista)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-amber-600">Pessimista</span>
                          <span className="text-sm font-bold text-amber-600">{fmtK(p.pessimista)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fluxo de Caixa Projetado */}
          {fluxoProjetado && fluxoProjetado.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Fluxo de Caixa Projetado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Mês</th>
                        <th className="p-2 text-right text-emerald-600">Receita Proj.</th>
                        <th className="p-2 text-right text-red-600">Despesa Proj.</th>
                        <th className="p-2 text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fluxoProjetado.map((f: any) => (
                        <tr key={f.mes} className="border-b last:border-0">
                          <td className="p-2 font-medium">{formatMonth(f.mes)}</td>
                          <td className="p-2 text-right text-emerald-600">{fmtK(f.receitaProjetada)}</td>
                          <td className="p-2 text-right text-red-600">{fmtK(f.despesaProjetada)}</td>
                          <td className={`p-2 text-right font-bold ${f.saldoProjetado >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtK(f.saldoProjetado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cohort Analysis */}
          {cohortAnalysis && cohortAnalysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Análise de Cohort (Retenção de Pagadores)
                </CardTitle>
                <CardDescription>Agrupa pagadores pelo mês de primeiro pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Cohort</th>
                        <th className="p-2 text-center">Total</th>
                        <th className="p-2 text-center">Retidos</th>
                        <th className="p-2 text-center">Churn</th>
                        <th className="p-2 text-center">Retenção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortAnalysis.map((c: any) => (
                        <tr key={c.mes} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-2 font-medium">{formatMonth(c.mes)}</td>
                          <td className="p-2 text-center">{c.totalPagadores}</td>
                          <td className="p-2 text-center text-emerald-600">{c.retidos}</td>
                          <td className="p-2 text-center text-red-600">{c.churned}</td>
                          <td className="p-2 text-center">
                            <Badge variant={c.taxaRetencao >= 70 ? "default" : c.taxaRetencao >= 40 ? "outline" : "destructive"} className="text-[9px]">
                              {c.taxaRetencao}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fluxo Semanal */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Fluxo Semanal Histórico</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background"><tr className="border-b"><th className="p-2 text-left">Semana</th><th className="p-2 text-right text-emerald-600">Receitas</th><th className="p-2 text-right text-red-600">Despesas</th><th className="p-2 text-right">Resultado</th></tr></thead>
                  <tbody>
                    {fluxoSemanal.map((s: any, i: number) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-2">{new Date(s.semana).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</td>
                        <td className="p-2 text-right text-emerald-600">{fmtK(s.receitas)}</td>
                        <td className="p-2 text-right text-red-600">{fmtK(s.despesas)}</td>
                        <td className={`p-2 text-right font-bold ${s.resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtK(s.resultado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: INADIMPLÊNCIA */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "inadimplencia" && (
        <div className="space-y-6">
          {/* Aging visual */}
          {aging && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" /> Aging de Recebíveis
                </CardTitle>
                <CardDescription>Classificação por dias de atraso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <AgingBar label="A Vencer (corrente)" value={aging.corrente.valor} count={aging.corrente.count} total={aging.corrente.valor + aging.totalVencido} color="emerald" />
                <AgingBar label="Vencido 1-30 dias" value={aging.vencido30.valor} count={aging.vencido30.count} total={aging.corrente.valor + aging.totalVencido} color="amber" />
                <AgingBar label="Vencido 31-60 dias" value={aging.vencido60.valor} count={aging.vencido60.count} total={aging.corrente.valor + aging.totalVencido} color="orange" />
                <AgingBar label="Vencido 61-90 dias" value={aging.vencido90.valor} count={aging.vencido90.count} total={aging.corrente.valor + aging.totalVencido} color="red" />
                <AgingBar label="Vencido 90+ dias (crítico)" value={aging.vencido90plus.valor} count={aging.vencido90plus.count} total={aging.corrente.valor + aging.totalVencido} color="red" />
                <div className="border-t pt-3 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">{fmt(aging.totalVencido)}</p>
                    <p className="text-[10px] text-muted-foreground">Total Vencido</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{fmt(aging.corrente.valor + aging.totalVencido)}</p>
                    <p className="text-[10px] text-muted-foreground">Total a Receber</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score de Inadimplência */}
          {inadimplencia && inadimplencia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" /> Score de Inadimplência por Pagador
                </CardTitle>
                <CardDescription>0 = adimplente · 100 = inadimplente crítico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inadimplencia.map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        d.score >= 70 ? "bg-red-500" : d.score >= 40 ? "bg-amber-500" : "bg-emerald-500"
                      }`}>
                        {d.score}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{d.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{d.motivo} · {d.diasAtraso} dias</p>
                      </div>
                      <p className="text-sm font-bold text-red-600">{fmt(d.valor)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {inadimplencia && inadimplencia.length === 0 && (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-lg font-semibold text-emerald-700">Nenhuma Inadimplência Detectada</p>
                <p className="text-sm text-muted-foreground">Todos os pagamentos estão em dia.</p>
              </CardContent>
            </Card>
          )}

          {/* Anomalias */}
          {anomalias && anomalias.length > 0 && (
            <Card className="border-amber-200/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Anomalias (Outliers)
                  <Badge variant="outline" className="text-[9px] ml-auto">{anomalias.length}</Badge>
                </CardTitle>
                <CardDescription>Transações com Z-score {'>'} 2 (significativamente acima da média)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {anomalias.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.descricao}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(a.data).toLocaleDateString("pt-BR")} · {a.motivo}</p>
                      </div>
                      <p className="text-sm font-bold text-amber-700">{fmt(a.valor)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: CUSTOS & CORTES */}
      {/* ═══════════════════════════════════════════ */}
      {tab === "custos" && (
        <div className="space-y-6">
          {/* Sugestões de Corte */}
          {sugestoes && sugestoes.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" /> Sugestões de Redução de Custos
                </CardTitle>
                <CardDescription>Baseadas em análise de padrões e benchmarks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sugestoes.map((s: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={s.impacto === "alto" ? "default" : s.impacto === "médio" ? "secondary" : "outline"} className="text-[9px]">
                          {s.impacto.toUpperCase()}
                        </Badge>
                        <p className="text-sm font-semibold">{s.area}</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-600">Economia: {fmtK(s.economia)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.descricao}</p>
                  </div>
                ))}
                <div className="border-t pt-3 text-center">
                  <p className="text-sm font-medium">Economia Total Potencial:</p>
                  <p className="text-2xl font-bold text-emerald-600">{fmtK(sugestoes.reduce((s: number, x: any) => s + x.economia, 0))}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Centros de Custo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" /> Centros de Custo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {centrosCusto.map((cc: any, i: number) => {
                const pct = resumo.totalDespesas > 0 ? Math.round((cc.total / resumo.totalDespesas) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{cc.nome}</span>
                      <span className="text-xs text-muted-foreground">{fmt(cc.total)} · {pct}% · {cc.count}x</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct > 25 ? "bg-red-500" : pct > 15 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recorrentes Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Repeat className="h-4 w-4 text-red-500" /> Despesas Recorrentes (Automáticas)
              </CardTitle>
              <CardDescription>Despesas que aparecem 3+ vezes — candidatas a renegociação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recorrentes.filter((r: any) => r.tipo === "DESPESA").map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-xs font-medium">{r.descricao}</p>
                      <p className="text-[10px] text-muted-foreground">{r.frequencia}x · média {fmtK(r.mediaPorOcorrencia)}/vez</p>
                    </div>
                    <p className="text-sm font-bold text-red-600">{fmtK(r.total)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights — always at bottom */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🧠 Insights Enterprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {resumo.concentracaoRisco > 50 && <p>⚠️ <strong>Concentração:</strong> Top 3 = {resumo.concentracaoRisco}% receita. Diversifique.</p>}
          {resumo.margem < 0 && <p>🚨 <strong>Déficit:</strong> Margem negativa de {resumo.margem}%.</p>}
          {resumo.margem >= 30 && <p>✅ <strong>Margem saudável:</strong> {resumo.margem}%.</p>}
          {burnRate && burnRate.burnLiquido <= 0 && <p>✅ <strong>Cash positive:</strong> +{fmtK(Math.abs(burnRate.burnLiquido))}/mês.</p>}
          {indices && indices.liquidezCorrente < 1 && <p>🚨 <strong>Liquidez crítica:</strong> {indices.liquidezCorrente}x — passivo supera ativo.</p>}
          {aging && aging.totalVencido > 0 && <p>⚠️ <strong>Recebíveis vencidos:</strong> {fmt(aging.totalVencido)} pendente de cobrança.</p>}
          <p>📊 Média: R$ {resumo.mediaReceitaDia}/dia receita vs R$ {resumo.mediaDespesaDia}/dia despesa</p>
          <p>📅 {resumo.diasAnalisados} dias analisados · {resumo.transacoes} transações · {resumo.pacientesAtivos} pacientes ativos</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const colors: Record<string, string> = { emerald: "text-emerald-600", red: "text-red-600", amber: "text-amber-600", blue: "text-blue-600", primary: "text-primary" };
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <Icon className={`h-4 w-4 mx-auto mb-1 ${colors[color] || "text-primary"}`} />
        <p className={`text-lg font-bold ${colors[color] || ""}`}>{value}</p>
        <p className="text-[9px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`text-center p-2 rounded-lg ${color === "red" ? "bg-red-50 dark:bg-red-950/20" : "bg-emerald-50 dark:bg-emerald-950/20"}`}>
      <p className={`text-sm font-bold ${color === "red" ? "text-red-600" : "text-emerald-600"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function DRELine({ label, value, bold, indent, positive, negative, highlight }: {
  label: string; value: number; bold?: boolean; indent?: boolean; positive?: boolean; negative?: boolean; highlight?: boolean;
}) {
  const fmt = (v: number) => `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  return (
    <div className={`flex items-center justify-between py-1.5 px-3 rounded ${highlight ? "bg-primary/5 border border-primary/10" : ""} ${indent ? "pl-6" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${positive ? "text-emerald-600" : negative ? "text-red-600" : ""}`}>
        {value < 0 ? "-" : ""}{fmt(value)}
      </span>
    </div>
  );
}

function DREBadge({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs px-6 py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={good ? "default" : "destructive"} className="text-[9px]">{value}</Badge>
    </div>
  );
}

function AgingBar({ label, value, count, total, color }: { label: string; value: number; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const bgColors: Record<string, string> = { emerald: "bg-emerald-500", amber: "bg-amber-500", orange: "bg-orange-500", red: "bg-red-500" };
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label} <span className="text-muted-foreground">({count})</span></span>
        <span className="text-xs font-medium">{fmt(value)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bgColors[color] || "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function IndexCard({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${good ? "border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-950/10" : "border-red-200/50 bg-red-50/30 dark:bg-red-950/10"}`}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${good ? "text-emerald-600" : "text-red-600"}`}>{value}</p>
    </div>
  );
}

function IndexCardFull({ label, value, description, good, benchmark }: { label: string; value: string; description: string; good: boolean; benchmark: string }) {
  return (
    <div className={`p-4 rounded-lg border ${good ? "border-emerald-200/50" : "border-red-200/50"}`}>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${good ? "text-emerald-600" : "text-red-600"}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
      <p className="text-[9px] mt-1"><Badge variant="outline" className="text-[8px]">Meta: {benchmark}</Badge></p>
    </div>
  );
}

function formatMonth(mes: string): string {
  const [year, month] = mes.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
}
