"use client";

import * as React from "react";
import Link from "next/link";
import {
  Loader2, TrendingUp, TrendingDown, Users, Building, CreditCard,
  Activity, Shield, AlertTriangle, BarChart3, Target, Clock,
  Flame, Repeat, ArrowUpRight, ArrowDownRight, Zap, Scissors,
  Brain, LineChart as LineIcon, PieChart as PieIcon, Wallet, DollarSign,
  Calendar, ListChecks, Sparkles, Send, FileText
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, BarChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLORS = ["#0d9488", "#22d3ee", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#ec4899", "#84cc16"];

export default function FinanceiroUnificadoPage() {
  const [dash, setDash] = React.useState<any>(null);
  const [prof, setProf] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"visao" | "ia" | "razao" | "dre" | "fluxo" | "avancado" | "projecoes" | "custos" | "inadimplencia" | "transacoes">("visao");

  // Razão contábil (Universal Journal) state
  const [razao, setRazao] = React.useState<any>(null);
  const [razaoLoading, setRazaoLoading] = React.useState(false);
  React.useEffect(() => {
    if (tab === "razao" && !razao) {
      setRazaoLoading(true);
      fetch("/api/financeiro/razao").then(r => r.json()).then(d => { if (d.success) setRazao(d.data); }).catch(() => {}).finally(() => setRazaoLoading(false));
    }
  }, [tab, razao]);

  // Drill-down state
  const [drill, setDrill] = React.useState<{ dimensao: string; valor: string; label: string } | null>(null);
  const [drillData, setDrillData] = React.useState<any>(null);
  const [drillLoading, setDrillLoading] = React.useState(false);

  const openDrill = React.useCallback(async (dimensao: string, valor: string, label: string, tipo?: string) => {
    setDrill({ dimensao, valor, label });
    setDrillLoading(true);
    setDrillData(null);
    try {
      const params = new URLSearchParams({ dimensao, valor });
      if (tipo) params.set("tipo", tipo);
      const res = await fetch(`/api/financeiro/drill?${params.toString()}`);
      const d = await res.json();
      if (d.success) setDrillData(d.data);
    } catch {}
    finally { setDrillLoading(false); }
  }, []);

  // IA state
  const [iaLoading, setIaLoading] = React.useState(false);
  const [iaStructured, setIaStructured] = React.useState<any>(null);
  const [iaRaw, setIaRaw] = React.useState<string | null>(null);
  const [iaResposta, setIaResposta] = React.useState<string | null>(null);
  const [iaInsights, setIaInsights] = React.useState<any[]>([]);
  const [iaAvailable, setIaAvailable] = React.useState<boolean | null>(null);
  const [pergunta, setPergunta] = React.useState("");

  const runIA = React.useCallback(async (q?: string) => {
    setIaLoading(true);
    if (!q) { setIaStructured(null); setIaRaw(null); }
    setIaResposta(null);
    try {
      const res = await fetch("/api/financeiro/ia-analise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q ? { pergunta: q } : {}),
      });
      const d = await res.json();
      if (d.success) {
        setIaAvailable(d.data.available);
        if (q) {
          setIaResposta(d.data.resposta || null);
        } else {
          setIaStructured(d.data.structured || null);
          setIaRaw(d.data.analiseRaw || null);
        }
        setIaInsights(d.data.insights || []);
      }
    } catch {}
    finally { setIaLoading(false); }
  }, []);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/financeiro/dashboard-avancado").then(r => r.json()).catch(() => null),
      fetch("/api/financeiro/analise-profunda").then(r => r.json()).catch(() => null),
    ]).then(([d, p]) => {
      if (d?.success) setDash(d.data);
      if (p?.success) setProf(p.data);
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const fmtK = (v: number) => Math.abs(v) >= 10000 ? `R$ ${(v / 1000).toFixed(1)}k` : fmt(v);

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Processando inteligência financeira...</p>
    </div>
  );

  if (!dash && !prof) return (
    <div className="p-8 text-center">
      <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-muted-foreground">Sem dados financeiros.</p>
    </div>
  );

  const resumo = prof?.resumo || {};
  const dre = prof?.dre;
  const burnRate = prof?.burnRate;
  const pontoEquilibrio = prof?.pontoEquilibrio;
  const indices = prof?.indices;
  const aging = prof?.aging;
  const alertas = prof?.alertas || [];
  const projecaoReceita = prof?.projecaoReceita || [];
  const cohortAnalysis = prof?.cohortAnalysis || [];
  const inadimplenciaScore = prof?.inadimplencia || [];
  const sugestoes = prof?.sugestoes || [];
  const anomalias = prof?.anomalias || [];
  const recorrentes = prof?.recorrentes || [];
  const topPagadores = prof?.topPagadores || [];
  const topCredores = prof?.topCredores || [];
  const centrosCusto = prof?.centrosCusto || [];
  const metodosPagamento = prof?.metodosPagamento || [];
  const curvaCaixa = prof?.curvaCaixa || [];
  const sazonalidade = prof?.sazonalidade || [];
  const varianciaReceita = prof?.varianciaReceita;
  const pareto = prof?.pareto;
  const capitalDeGiro = prof?.capitalDeGiro;

  const periodos = dash?.periodos || [];
  const projecaoDash = dash?.projecao || [];
  const kpis = dash?.kpis || {};
  const categorias = dash?.categorias || { receitas: [], despesas: [] };

  const tabs = [
    { id: "visao", label: "Visão Geral", icon: PieIcon },
    { id: "ia", label: "IA Financeira", icon: Sparkles },
    { id: "razao", label: "Razão Contábil", icon: Building },
    { id: "dre", label: "DRE & Índices", icon: BarChart3 },
    { id: "fluxo", label: "Fluxo de Caixa", icon: Activity },
    { id: "avancado", label: "Análises Avançadas", icon: Brain },
    { id: "projecoes", label: "Projeções", icon: LineIcon },
    { id: "custos", label: "Custos & Cortes", icon: Scissors },
    { id: "inadimplencia", label: "Inadimplência", icon: AlertTriangle },
    { id: "transacoes", label: "Pagadores/Credores", icon: ListChecks },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" /> Central Financeira
          </h1>
          <p className="text-sm text-muted-foreground">
            Dashboard + Análise Profunda · Previsto×Realizado · DRE · Burn Rate · Aging · Cohort · IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link href="/financeiro">Lançamentos</Link></Button>
          <Button variant="outline" size="sm" asChild><Link href="/financeiro/cobrancas">Cobranças</Link></Button>
        </div>
      </div>

      {/* Alertas Preditivos */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a: any, i: number) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
              a.severidade === "critico" ? "bg-red-50 border-red-200 dark:bg-red-950/20" :
              a.severidade === "alto" ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20" :
              "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
            }`}>
              <Zap className={`h-4 w-4 mt-0.5 shrink-0 ${a.severidade === "critico" ? "text-red-600" : a.severidade === "alto" ? "text-amber-600" : "text-blue-600"}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{a.titulo}</p>
                <p className="text-xs text-muted-foreground">{a.descricao}</p>
              </div>
              <Badge variant={a.severidade === "critico" ? "destructive" : "outline"} className="text-[9px] shrink-0">{a.severidade.toUpperCase()}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${tab === t.id ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ VISÃO GERAL ═══════════ */}
      {tab === "visao" && (
        <div className="space-y-6">
          {/* Health + KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {prof && (
              <Card className={`${resumo.healthScore >= 70 ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : resumo.healthScore >= 40 ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
                <CardContent className="p-3 text-center">
                  <Shield className={`h-5 w-5 mx-auto mb-1 ${resumo.healthScore >= 70 ? "text-emerald-600" : resumo.healthScore >= 40 ? "text-amber-600" : "text-red-600"}`} />
                  <p className="text-2xl font-bold">{resumo.healthScore}</p>
                  <p className="text-[9px] text-muted-foreground">SAÚDE</p>
                </CardContent>
              </Card>
            )}
            <Metric icon={ArrowUpRight} label="Receitas (total)" value={fmtK(resumo.totalReceitas || 0)} color="emerald" />
            <Metric icon={ArrowDownRight} label="Despesas (total)" value={fmtK(resumo.totalDespesas || 0)} color="red" />
            <Metric icon={TrendingUp} label="Margem" value={`${resumo.margem || 0}%`} color={(resumo.margem || 0) >= 0 ? "emerald" : "red"} />
            <Metric icon={Users} label="Ativos" value={`${resumo.pacientesAtivos || kpis.pacientesAtivos || 0}`} color="blue" />
            <Metric icon={DollarSign} label="Ticket Médio" value={fmtK(kpis.ticketMedio || 0)} color="primary" />
          </div>

          {/* Previsto vs Realizado Chart */}
          {periodos.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Previsto × Realizado × Despesas</CardTitle>
                <CardDescription>Evolução mensal da receita esperada vs recebida</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={periodos}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="periodo" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Legend fontSize={11} />
                    <Bar dataKey="previsto" name="Previsto" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="realizado" name="Realizado" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Line dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Resultado mensal area chart */}
          {periodos.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Resultado Líquido Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={periodos}>
                    <defs>
                      <linearGradient id="colorResult" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="periodo" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Area dataKey="resultado" name="Resultado" stroke="#0d9488" strokeWidth={2} fill="url(#colorResult)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Waterfall + Heatmap */}
          {periodos.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Cascata de Resultado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={buildWaterfall(periodos)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="periodo" fontSize={10} />
                      <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => fmt(v)} />
                      <Bar dataKey="base" stackId="a" fill="transparent" />
                      <Bar dataKey="ganho" stackId="a" fill="#0d9488" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="perda" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Heatmap Mensal</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[220px]">
                  <Heatmap periodos={periodos} fmt={fmt} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Burn/Runway/Break-even */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {burnRate && (
              <Card className="border-orange-200/50">
                <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Burn Rate</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg"><p className="text-sm font-bold text-red-600">{fmtK(burnRate.mensal)}</p><p className="text-[9px] text-muted-foreground">Gasto/mês</p></div>
                    <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg"><p className="text-sm font-bold text-emerald-600">{fmtK(burnRate.receitaMensal)}</p><p className="text-[9px] text-muted-foreground">Receita/mês</p></div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <p className={`text-lg font-bold ${burnRate.burnLiquido > 0 ? "text-red-600" : "text-emerald-600"}`}>{burnRate.burnLiquido > 0 ? "-" : "+"}{fmtK(Math.abs(burnRate.burnLiquido))}</p>
                    <p className="text-[9px] text-muted-foreground">Burn Líquido/mês</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {burnRate && (
              <Card className={`${burnRate.runwayDias < 90 ? "border-red-200" : burnRate.runwayDias < 180 ? "border-amber-200" : "border-emerald-200"}`}>
                <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Runway</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4 text-center space-y-2">
                  {burnRate.runwayDias >= 999 ? (
                    <><p className="text-3xl font-bold text-emerald-600">∞</p><p className="text-xs text-emerald-600 font-medium">Sustentável</p></>
                  ) : (
                    <>
                      <p className={`text-3xl font-bold ${burnRate.runwayDias < 90 ? "text-red-600" : burnRate.runwayDias < 180 ? "text-amber-600" : "text-emerald-600"}`}>{burnRate.runwayMeses}m</p>
                      <p className="text-[10px] text-muted-foreground">{burnRate.runwayDias} dias de caixa</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            {pontoEquilibrio && (
              <Card className="border-blue-200/50">
                <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> Ponto de Equilíbrio</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4 text-center space-y-1">
                  <p className="text-3xl font-bold text-blue-600">{pontoEquilibrio.pacientesNecessarios}</p>
                  <p className="text-[10px] text-muted-foreground">pacientes p/ break-even</p>
                  <Badge variant={pontoEquilibrio.deficit > 0 ? "destructive" : "default"} className="text-[9px]">
                    {pontoEquilibrio.pacientesAtivos} ativos {pontoEquilibrio.deficit > 0 ? `(-${pontoEquilibrio.deficit})` : "✓"}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Categorias Pie Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorias.receitas.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Receitas por Categoria (ano)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categorias.receitas} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.categoria}>
                        {categorias.receitas.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            {centrosCusto.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Despesas por Centro de Custo</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={centrosCusto} dataKey="total" nameKey="nome" cx="50%" cy="50%" outerRadius={80}>
                        {centrosCusto.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => fmt(v)} />
                      <Legend fontSize={9} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Aging + Indices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {aging && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Aging de Recebíveis</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <AgingBar label="A vencer" value={aging.corrente.valor} count={aging.corrente.count} total={aging.corrente.valor + aging.totalVencido} color="emerald" />
                  <AgingBar label="1-30 dias" value={aging.vencido30.valor} count={aging.vencido30.count} total={aging.corrente.valor + aging.totalVencido} color="amber" />
                  <AgingBar label="31-60 dias" value={aging.vencido60.valor} count={aging.vencido60.count} total={aging.corrente.valor + aging.totalVencido} color="orange" />
                  <AgingBar label="61-90 dias" value={aging.vencido90.valor} count={aging.vencido90.count} total={aging.corrente.valor + aging.totalVencido} color="red" />
                  <AgingBar label="90+ dias" value={aging.vencido90plus.valor} count={aging.vencido90plus.count} total={aging.corrente.valor + aging.totalVencido} color="red" />
                </CardContent>
              </Card>
            )}
            {indices && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Índices Financeiros</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <IndexCard label="Liquidez Corrente" value={`${indices.liquidezCorrente}x`} good={indices.liquidezCorrente >= 1} />
                    <IndexCard label="EBITDA" value={fmtK(indices.ebitda)} good={indices.ebitda > 0} />
                    <IndexCard label="Margem EBITDA" value={`${indices.margemEbitda}%`} good={indices.margemEbitda > 15} />
                    <IndexCard label="ROA" value={`${indices.roa}%`} good={indices.roa > 5} />
                    <IndexCard label="DSO" value={`${indices.cicloFinanceiro}d`} good={indices.cicloFinanceiro < 30} />
                    <IndexCard label="A Receber" value={fmtK(indices.recebiveisTotal)} good={true} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ IA FINANCEIRA ═══════════ */}
      {tab === "ia" && (
        <div className="space-y-6">
          {/* Hero */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold">CFO Virtual — Análise com IA</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Inteligência NVIDIA cruza todos os dados financeiros e operacionais em tempo real para revelar o que passa despercebido.
                  </p>
                  {!iaStructured && !iaRaw && iaInsights.length === 0 && (
                    <Button onClick={() => runIA()} disabled={iaLoading}>
                      {iaLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                      Analisar Saúde Financeira
                    </Button>
                  )}
                </div>
                {(iaStructured || iaRaw) && (
                  <Button variant="outline" size="sm" onClick={() => runIA()} disabled={iaLoading}>
                    <Repeat className="h-3 w-3 mr-1" /> Nova Análise
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Natural language question */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <input
                  value={pergunta}
                  onChange={e => setPergunta(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && pergunta.trim()) runIA(pergunta); }}
                  placeholder="Pergunte em linguagem natural: 'Por que caiu a receita em maio?' ou 'Onde posso economizar?'"
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
                <Button onClick={() => pergunta.trim() && runIA(pergunta)} disabled={iaLoading || !pergunta.trim()}>
                  {iaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {iaLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">A IA está analisando profundamente os dados...</p>
            </div>
          )}

          {/* Natural language answer */}
          {iaResposta && !iaLoading && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Resposta</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap leading-relaxed">{iaResposta}</p></CardContent>
            </Card>
          )}

          {/* STRUCTURED AI ANALYSIS — visual cards */}
          {iaStructured && !iaLoading && (
            <div className="space-y-5">
              {/* Health Score + Executive Summary */}
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className={`p-6 flex flex-col items-center justify-center text-white ${
                    iaStructured.healthScore >= 70 ? "bg-emerald-600" : iaStructured.healthScore >= 40 ? "bg-amber-500" : "bg-red-600"
                  }`}>
                    <p className="text-5xl font-bold">{iaStructured.healthScore}</p>
                    <p className="text-xs opacity-90 mt-1">SAÚDE FINANCEIRA</p>
                  </div>
                  <div className="md:col-span-3 p-6 flex items-center">
                    <p className="text-sm leading-relaxed">{iaStructured.resumoExecutivo}</p>
                  </div>
                </div>
              </Card>

              {/* KPIs Destaque */}
              {iaStructured.kpisDestaque?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {iaStructured.kpisDestaque.map((k: any, i: number) => {
                    const colorMap: Record<string, string> = { green: "text-emerald-600", red: "text-red-600", amber: "text-amber-600", blue: "text-blue-600" };
                    return (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground">{k.label}</p>
                            {k.tendencia === "up" ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : k.tendencia === "down" ? <TrendingDown className="h-3 w-3 text-red-600" /> : null}
                          </div>
                          <p className={`text-lg font-bold ${colorMap[k.cor] || ""}`}>{k.valor}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Diagnóstico */}
                {iaStructured.diagnostico?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">🔍 Diagnóstico</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {iaStructured.diagnostico.map((d: any, i: number) => (
                        <div key={i} className={`p-2.5 rounded-lg border-l-4 ${
                          d.severidade === "positivo" ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10" :
                          d.severidade === "critico" ? "border-red-500 bg-red-50/50 dark:bg-red-950/10" :
                          d.severidade === "atencao" ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/10" :
                          "border-slate-300 bg-muted/30"
                        }`}>
                          <p className="text-xs font-semibold">{d.titulo}</p>
                          <p className="text-[11px] text-muted-foreground">{d.detalhe}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Riscos */}
                {iaStructured.riscos?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">⚠️ Riscos Ocultos</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {iaStructured.riscos.map((r: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/30 flex items-start gap-2">
                          <Badge variant={r.impacto === "alto" ? "destructive" : "outline"} className="text-[8px] shrink-0 mt-0.5">{(r.impacto || "").toUpperCase()}</Badge>
                          <div>
                            <p className="text-xs font-semibold">{r.titulo}</p>
                            <p className="text-[11px] text-muted-foreground">{r.detalhe}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Oportunidades — com ganho potencial */}
              {iaStructured.oportunidades?.length > 0 && (
                <Card className="border-emerald-200/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">💡 Oportunidades
                      <Badge variant="default" className="text-[9px] ml-auto bg-emerald-600">
                        Potencial: {fmt(iaStructured.oportunidades.reduce((s: number, o: any) => s + (o.ganhoPotencialMensal || 0), 0))}/mês
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Bar chart of opportunities */}
                    {iaStructured.oportunidades.some((o: any) => o.ganhoPotencialMensal > 0) && (
                      <ResponsiveContainer width="100%" height={Math.max(120, iaStructured.oportunidades.length * 42)}>
                        <BarChart data={iaStructured.oportunidades.filter((o: any) => o.ganhoPotencialMensal > 0)} layout="vertical" margin={{ left: 10, right: 40 }}>
                          <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={10} />
                          <YAxis type="category" dataKey="titulo" fontSize={9} width={130} />
                          <Tooltip formatter={(v: any) => `${fmt(v)}/mês`} />
                          <Bar dataKey="ganhoPotencialMensal" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <div className="space-y-2 mt-2">
                      {iaStructured.oportunidades.map((o: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/10">
                          <div>
                            <p className="text-xs font-semibold">{o.titulo}</p>
                            <p className="text-[11px] text-muted-foreground">{o.detalhe}</p>
                          </div>
                          {o.ganhoPotencialMensal > 0 && <p className="text-xs font-bold text-emerald-600 shrink-0">+{fmtK(o.ganhoPotencialMensal)}/mês</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ações Priorizadas */}
              {iaStructured.acoes?.length > 0 && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">🎯 Plano de Ação Priorizado</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[...iaStructured.acoes].sort((a: any, b: any) => (a.prioridade || 9) - (b.prioridade || 9)).map((a: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            {a.prioridade || i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold">{a.titulo}</p>
                              {a.prazo && <Badge variant="outline" className="text-[8px]">{a.prazo}</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{a.descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Raw text fallback if JSON parse failed */}
          {iaRaw && !iaStructured && !iaLoading && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Análise da IA</CardTitle></CardHeader>
              <CardContent><div className="whitespace-pre-wrap text-sm leading-relaxed">{iaRaw}</div></CardContent>
            </Card>
          )}

          {/* Rule-based insights fallback */}
          {iaInsights.length > 0 && !iaLoading && (
            <div className="space-y-3">
              {iaAvailable === false && (
                <p className="text-xs text-muted-foreground">💡 Análise baseada em regras (IA indisponível no momento).</p>
              )}
              {iaInsights.map((ins: any, i: number) => (
                <Card key={i} className={
                  ins.tipo === "risco" ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" :
                  ins.tipo === "oportunidade" ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10" :
                  "border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
                }>
                  <CardContent className="p-4 flex items-start gap-3">
                    {ins.tipo === "risco" ? <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" /> :
                     ins.tipo === "oportunidade" ? <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5" /> :
                     <Shield className="h-4 w-4 text-blue-600 mt-0.5" />}
                    <div>
                      <p className="text-sm font-semibold">{ins.titulo}</p>
                      <p className="text-xs text-muted-foreground">{ins.texto}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Waterfall chart — resultado build-up */}
          {periodos.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Cascata de Resultado (Waterfall)</CardTitle>
                <CardDescription>Como cada mês contribui para o resultado acumulado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={buildWaterfall(periodos)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="periodo" fontSize={10} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Bar dataKey="base" stackId="a" fill="transparent" />
                    <Bar dataKey="ganho" stackId="a" fill="#0d9488" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="perda" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Heatmap mensal de resultado */}
          {periodos.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Heatmap de Performance Mensal</CardTitle>
                <CardDescription>Verde = superávit · Vermelho = déficit · Intensidade = magnitude</CardDescription>
              </CardHeader>
              <CardContent>
                <Heatmap periodos={periodos} fmt={fmt} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════ RAZÃO CONTÁBIL (Universal Journal) ═══════════ */}
      {tab === "razao" && (
        <div className="space-y-6">
          {razaoLoading && (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          )}
          {razao && !razaoLoading && (
            <>
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4 text-primary" /> Razão Contábil Universal</CardTitle>
                  <CardDescription>Cada movimentação classificada em plano de contas · {razao.totalLancamentos} lançamentos · partida dobrada</CardDescription>
                </CardHeader>
              </Card>

              {/* Balancete (Trial Balance) */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> Balancete de Verificação</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="p-2 text-left">Conta</th>
                          <th className="p-2 text-left">Descrição</th>
                          <th className="p-2 text-left">Grupo</th>
                          <th className="p-2 text-left">Tipo</th>
                          <th className="p-2 text-right">Débito</th>
                          <th className="p-2 text-right">Crédito</th>
                          <th className="p-2 text-right">Saldo</th>
                          <th className="p-2 text-center">Lçtos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {razao.balancete.map((b: any) => (
                          <tr key={b.conta} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                            onClick={() => openDrill("categoria", "", `${b.conta} — ${b.nome}`)}>
                            <td className="p-2 font-mono">{b.conta}</td>
                            <td className="p-2 font-medium">{b.nome}</td>
                            <td className="p-2"><Badge variant="outline" className={`text-[8px] ${b.grupo === "RECEITA" ? "text-emerald-600 border-emerald-300" : b.grupo === "DESPESA" ? "text-red-600 border-red-300" : "text-blue-600 border-blue-300"}`}>{b.grupo}</Badge></td>
                            <td className="p-2 text-muted-foreground text-[10px]">{b.tipo}</td>
                            <td className="p-2 text-right text-red-600">{b.debito > 0 ? fmt(b.debito) : "—"}</td>
                            <td className="p-2 text-right text-emerald-600">{b.credito > 0 ? fmt(b.credito) : "—"}</td>
                            <td className="p-2 text-right font-bold">{fmt(b.saldo)}</td>
                            <td className="p-2 text-center text-muted-foreground">{b.count}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 font-bold bg-muted/20">
                          <td className="p-2" colSpan={4}>TOTAIS</td>
                          <td className="p-2 text-right text-red-600">{fmt(razao.balancete.reduce((s: number, b: any) => s + b.debito, 0))}</td>
                          <td className="p-2 text-right text-emerald-600">{fmt(razao.balancete.reduce((s: number, b: any) => s + b.credito, 0))}</td>
                          <td className="p-2 text-right" colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center pt-2">💡 Clique numa conta para ver os lançamentos</p>
                </CardContent>
              </Card>

              {/* Controlling — resultado por tipo de conta */}
              {razao.porTipo?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Controlling — Resultado por Natureza</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={razao.porTipo}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="tipo" fontSize={9} angle={-20} textAnchor="end" height={60} interval={0} />
                        <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmt(v)} />
                        <Legend fontSize={10} />
                        <Bar dataKey="receita" name="Receita" fill="#0d9488" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Livro Razão (lançamentos) */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Livro-Razão (Lançamentos)</CardTitle>
                  <CardDescription>Diário de todas as partidas contábeis</CardDescription></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-[11px]">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b">
                          <th className="p-1.5 text-left">Documento</th>
                          <th className="p-1.5 text-left">Data</th>
                          <th className="p-1.5 text-left">Conta</th>
                          <th className="p-1.5 text-left">Business Partner</th>
                          <th className="p-1.5 text-left">Histórico</th>
                          <th className="p-1.5 text-center">D/C</th>
                          <th className="p-1.5 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {razao.ledger.map((l: any, i: number) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-1.5 font-mono text-[9px] text-muted-foreground">{l.docNum}</td>
                            <td className="p-1.5 whitespace-nowrap">{new Date(l.data).toLocaleDateString("pt-BR")}</td>
                            <td className="p-1.5"><span className="font-mono">{l.conta}</span> <span className="text-muted-foreground">{l.contaNome}</span></td>
                            <td className="p-1.5 max-w-[140px] truncate">{l.businessPartner}</td>
                            <td className="p-1.5 max-w-[200px] truncate text-muted-foreground">{l.historico}</td>
                            <td className="p-1.5 text-center"><Badge variant="outline" className={`text-[8px] ${l.natureza === "Crédito" ? "text-emerald-600" : "text-red-600"}`}>{l.natureza === "Crédito" ? "C" : "D"}</Badge></td>
                            <td className={`p-1.5 text-right font-medium ${l.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"}`}>{fmt(l.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {razao.totalLancamentos > 300 && <p className="text-[10px] text-muted-foreground text-center py-2">Mostrando 300 de {razao.totalLancamentos} lançamentos</p>}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ═══════════ FLUXO DE CAIXA ═══════════ */}
      {tab === "fluxo" && (
        <div className="space-y-6">
          {/* Curva de caixa acumulada */}
          {curvaCaixa.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Curva de Saldo Acumulado</CardTitle>
                <CardDescription>Evolução diária do caixa ao longo do período</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={curvaCaixa}>
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="dia" fontSize={9} tickFormatter={(d) => d.slice(5)} minTickGap={30} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Area dataKey="saldoAcumulado" name="Saldo Acumulado" stroke="#0d9488" strokeWidth={2} fill="url(#colorSaldo)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Entradas vs Saídas diárias */}
          {curvaCaixa.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Entradas × Saídas Diárias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={curvaCaixa}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="dia" fontSize={9} tickFormatter={(d) => d.slice(5)} minTickGap={30} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Legend fontSize={10} />
                    <Bar dataKey="entradas" name="Entradas" fill="#0d9488" />
                    <Bar dataKey="saidas" name="Saídas" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Sazonalidade por dia da semana */}
          {sazonalidade.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Sazonalidade por Dia da Semana</CardTitle>
                <CardDescription>Em quais dias entra e sai mais dinheiro</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sazonalidade}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="dia" fontSize={11} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Legend fontSize={10} />
                    <Bar dataKey="receitas" name="Receitas" fill="#0d9488" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════ ANÁLISES AVANÇADAS ═══════════ */}
      {tab === "avancado" && (
        <div className="space-y-6">
          {/* Variância Orçamentária */}
          {varianciaReceita && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Variância Orçamentária (Previsto × Realizado)</CardTitle>
                <CardDescription>Receita esperada das mensalidades vs receita real média/mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20"><p className="text-lg font-bold text-violet-600">{fmt(varianciaReceita.previsto)}</p><p className="text-[10px] text-muted-foreground">Previsto/mês</p></div>
                  <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><p className="text-lg font-bold text-emerald-600">{fmt(varianciaReceita.realizado)}</p><p className="text-[10px] text-muted-foreground">Realizado/mês</p></div>
                  <div className={`text-center p-3 rounded-lg ${varianciaReceita.variancia >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                    <p className={`text-lg font-bold ${varianciaReceita.variancia >= 0 ? "text-emerald-600" : "text-red-600"}`}>{varianciaReceita.variancia >= 0 ? "+" : ""}{fmt(varianciaReceita.variancia)}</p>
                    <p className="text-[10px] text-muted-foreground">Variância</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${varianciaReceita.varianciaPct >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                    <p className={`text-lg font-bold ${varianciaReceita.varianciaPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>{varianciaReceita.varianciaPct >= 0 ? "+" : ""}{varianciaReceita.varianciaPct}%</p>
                    <p className="text-[10px] text-muted-foreground">Variância %</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise de Pareto 80/20 */}
          {pareto && pareto.dados.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Análise de Pareto (80/20)</CardTitle>
                <CardDescription>{pareto.credoresPara80pct} de {pareto.totalCredores} credores ({pareto.concentracao}%) concentram 80% das despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={pareto.dados}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="nome" fontSize={8} angle={-30} textAnchor="end" height={70} interval={0} />
                    <YAxis yAxisId="left" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" fontSize={10} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                    <Tooltip formatter={(v: any, n: any) => n === "acumuladoPct" ? `${v}%` : fmt(v)} />
                    <Bar yAxisId="left" dataKey="valor" name="Valor" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="right" dataKey="acumuladoPct" name="Acumulado %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Capital de Giro */}
          {capitalDeGiro && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Capital de Giro & Ciclo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><p className="text-base font-bold text-emerald-600">{fmtK(capitalDeGiro.recebiveis)}</p><p className="text-[9px] text-muted-foreground">A Receber</p></div>
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20"><p className="text-base font-bold text-red-600">{fmtK(capitalDeGiro.pagaveis)}</p><p className="text-[9px] text-muted-foreground">A Pagar</p></div>
                  <div className={`text-center p-3 rounded-lg ${capitalDeGiro.capitalGiroLiquido >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"}`}><p className={`text-base font-bold ${capitalDeGiro.capitalGiroLiquido >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtK(capitalDeGiro.capitalGiroLiquido)}</p><p className="text-[9px] text-muted-foreground">Capital Giro Líq.</p></div>
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-base font-bold text-blue-600">{capitalDeGiro.dso}d</p><p className="text-[9px] text-muted-foreground">DSO</p></div>
                  <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20"><p className="text-base font-bold text-amber-600">{fmtK(capitalDeGiro.necessidadeCapitalGiro)}</p><p className="text-[9px] text-muted-foreground">NCG</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cohort */}
          {cohortAnalysis.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Cohort — Retenção de Pagadores</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b"><th className="p-2 text-left">Cohort</th><th className="p-2 text-center">Total</th><th className="p-2 text-center">Retidos</th><th className="p-2 text-center">Churn</th><th className="p-2 text-center">Retenção</th></tr></thead>
                    <tbody>
                      {cohortAnalysis.map((c: any) => (
                        <tr key={c.mes} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-2 font-medium">{c.mes}</td>
                          <td className="p-2 text-center">{c.totalPagadores}</td>
                          <td className="p-2 text-center text-emerald-600">{c.retidos}</td>
                          <td className="p-2 text-center text-red-600">{c.churned}</td>
                          <td className="p-2 text-center"><Badge variant={c.taxaRetencao >= 70 ? "default" : "destructive"} className="text-[9px]">{c.taxaRetencao}%</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════ DRE & ÍNDICES ═══════════ */}
      {tab === "dre" && dre && (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> DRE — Demonstrativo de Resultado</CardTitle>
              <CardDescription>{resumo.diasAnalisados} dias · {resumo.transacoes} transações</CardDescription></CardHeader>
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
                <DRELine label="= EBIT" value={dre.lucroOperacional} bold positive={dre.lucroOperacional >= 0} negative={dre.lucroOperacional < 0} />
                <DRELine label="= EBITDA" value={dre.ebitda} bold positive={dre.ebitda >= 0} negative={dre.ebitda < 0} highlight />
                <DREBadge label="Margem EBITDA" value={`${dre.margemEbitda}%`} good={dre.margemEbitda > 15} />
                <div className="border-t my-3" />
                <DRELine label="(-) Despesas Financeiras" value={dre.despesasFinanceiras} indent negative />
                <DRELine label="= Lucro Líquido" value={dre.lucroLiquido} bold positive={dre.lucroLiquido >= 0} negative={dre.lucroLiquido < 0} highlight />
                <DREBadge label="Margem Líquida" value={`${dre.margemLiquida}%`} good={dre.margemLiquida > 5} />
              </div>
            </CardContent>
          </Card>

          {metodosPagamento.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> Métodos de Pagamento</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metodosPagamento} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={10} />
                    <YAxis type="category" dataKey="nome" fontSize={10} width={90} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Bar dataKey="total" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════ PROJEÇÕES & IA ═══════════ */}
      {tab === "projecoes" && (
        <div className="space-y-6">
          {projecaoReceita.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader><CardTitle className="flex items-center gap-2"><LineIcon className="h-5 w-5 text-primary" /> Projeção de Receita (IA)</CardTitle>
                <CardDescription>Regressão linear + sazonalidade · Próximos 3 meses</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={projecaoReceita}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="mes" fontSize={11} tickFormatter={(m) => m.slice(5)} />
                    <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => fmt(v)} />
                    <Legend fontSize={11} />
                    <Area dataKey="otimista" name="Otimista" fill="#a7f3d0" stroke="#10b981" fillOpacity={0.3} />
                    <Line dataKey="realista" name="Realista" stroke="#0d9488" strokeWidth={3} />
                    <Area dataKey="pessimista" name="Pessimista" fill="#fed7aa" stroke="#f59e0b" fillOpacity={0.3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {projecaoDash.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Fluxo de Caixa Projetado</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b"><th className="p-2 text-left">Mês</th><th className="p-2 text-right text-emerald-600">Receita Proj.</th><th className="p-2 text-right text-red-600">Despesa Proj.</th><th className="p-2 text-right">Resultado</th></tr></thead>
                    <tbody>
                      {projecaoDash.map((p: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2 font-medium">{p.periodo}</td>
                          <td className="p-2 text-right text-emerald-600">{fmtK(p.receitaProjetada)}</td>
                          <td className="p-2 text-right text-red-600">{fmtK(p.despesaProjetada)}</td>
                          <td className={`p-2 text-right font-bold ${p.resultadoProjetado >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtK(p.resultadoProjetado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {cohortAnalysis.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Cohort — Retenção de Pagadores</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b"><th className="p-2 text-left">Cohort</th><th className="p-2 text-center">Total</th><th className="p-2 text-center">Retidos</th><th className="p-2 text-center">Churn</th><th className="p-2 text-center">Retenção</th></tr></thead>
                    <tbody>
                      {cohortAnalysis.map((c: any) => (
                        <tr key={c.mes} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-2 font-medium">{c.mes}</td>
                          <td className="p-2 text-center">{c.totalPagadores}</td>
                          <td className="p-2 text-center text-emerald-600">{c.retidos}</td>
                          <td className="p-2 text-center text-red-600">{c.churned}</td>
                          <td className="p-2 text-center"><Badge variant={c.taxaRetencao >= 70 ? "default" : "destructive"} className="text-[9px]">{c.taxaRetencao}%</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════ CUSTOS & CORTES ═══════════ */}
      {tab === "custos" && (
        <div className="space-y-6">
          {sugestoes.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader><CardTitle className="flex items-center gap-2"><Scissors className="h-5 w-5 text-primary" /> Sugestões de Redução de Custos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {sugestoes.map((s: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={s.impacto === "alto" ? "default" : "secondary"} className="text-[9px]">{s.impacto.toUpperCase()}</Badge>
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

          {centrosCusto.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4 text-primary" /> Centros de Custo</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {centrosCusto.map((cc: any, i: number) => {
                  const pct = resumo.totalDespesas > 0 ? Math.round((cc.total / resumo.totalDespesas) * 100) : 0;
                  return (
                    <button key={i} className="w-full text-left group" onClick={() => openDrill("centroCusto", cc.nome, cc.nome, "DESPESA")}>
                      <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium group-hover:text-primary flex items-center gap-1">{cc.nome} <span className="opacity-0 group-hover:opacity-100 text-[9px]">🔍</span></span><span className="text-xs text-muted-foreground">{fmt(cc.total)} · {pct}% · {cc.count}x</span></div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct > 25 ? "bg-red-500" : pct > 15 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${pct}%` }} /></div>
                    </button>
                  );
                })}
                <p className="text-[10px] text-muted-foreground text-center pt-2">💡 Clique num centro de custo para ver as transações</p>
              </CardContent>
            </Card>
          )}

          {recorrentes.filter((r: any) => r.tipo === "DESPESA").length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Repeat className="h-4 w-4 text-red-500" /> Despesas Recorrentes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recorrentes.filter((r: any) => r.tipo === "DESPESA").map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div><p className="text-xs font-medium">{r.descricao}</p><p className="text-[10px] text-muted-foreground">{r.frequencia}x · média {fmtK(r.mediaPorOcorrencia)}/vez</p></div>
                      <p className="text-sm font-bold text-red-600">{fmtK(r.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════ INADIMPLÊNCIA ═══════════ */}
      {tab === "inadimplencia" && (
        <div className="space-y-6">
          {inadimplenciaScore.length > 0 ? (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> Score de Inadimplência</CardTitle>
                <CardDescription>0 = adimplente · 100 = crítico</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inadimplenciaScore.map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${d.score >= 70 ? "bg-red-500" : d.score >= 40 ? "bg-amber-500" : "bg-emerald-500"}`}>{d.score}</div>
                      <div className="flex-1"><p className="text-sm font-medium">{d.nome}</p><p className="text-[10px] text-muted-foreground">{d.motivo} · {d.diasAtraso} dias</p></div>
                      <p className="text-sm font-bold text-red-600">{fmt(d.valor)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-lg font-semibold text-emerald-700">Nenhuma Inadimplência Detectada</p>
              </CardContent>
            </Card>
          )}

          {anomalias.length > 0 && (
            <Card className="border-amber-200/50">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Anomalias (Outliers)<Badge variant="outline" className="text-[9px] ml-auto">{anomalias.length}</Badge></CardTitle>
                <CardDescription>Transações com Z-score {'>'} 2</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {anomalias.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                      <div className="flex-1"><p className="text-sm font-medium">{a.descricao}</p><p className="text-[10px] text-muted-foreground">{new Date(a.data).toLocaleDateString("pt-BR")} · {a.motivo}</p></div>
                      <p className="text-sm font-bold text-amber-700">{fmt(a.valor)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════ PAGADORES/CREDORES ═══════════ */}
      {tab === "transacoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> Top Pagadores</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {topPagadores.map((p: any, i: number) => (
                  <button key={i} className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 text-left" onClick={() => openDrill("pagador", p.nome, p.nome, "RECEITA")}>
                    <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div><p className="text-xs font-medium truncate max-w-[180px]">{p.nome}</p><p className="text-[9px] text-muted-foreground">{p.count}x · TM: {fmtK(p.ticketMedio || p.total / p.count)}</p></div></div>
                    <p className="text-xs font-bold text-emerald-600">{fmtK(p.total)}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-600" /> Top Credores</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {topCredores.map((c: any, i: number) => (
                  <button key={i} className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 text-left" onClick={() => openDrill("credor", c.nome, c.nome, "DESPESA")}>
                    <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div><p className="text-xs font-medium truncate max-w-[180px]">{c.nome}</p><p className="text-[9px] text-muted-foreground">{c.count}x · {c.categoria}</p></div></div>
                    <p className="text-xs font-bold text-red-600">{fmtK(c.total)}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════ DRILL-DOWN MODAL ═══════════ */}
      {drill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDrill(null)}>
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> {drill.label}</h2>
                <p className="text-xs text-muted-foreground">Detalhamento de transações · drill-down</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDrill(null)}>✕</Button>
            </div>

            <div className="overflow-y-auto flex-1">
              {drillLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : drillData ? (
                <div className="p-4 space-y-4">
                  {/* Resumo */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold">{drillData.resumo.count}</p><p className="text-[9px] text-muted-foreground">Transações</p></div>
                    {drillData.resumo.totalReceitas > 0 && <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><p className="text-sm font-bold text-emerald-600">{fmtK(drillData.resumo.totalReceitas)}</p><p className="text-[9px] text-muted-foreground">Receitas</p></div>}
                    {drillData.resumo.totalDespesas > 0 && <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20"><p className="text-sm font-bold text-red-600">{fmtK(drillData.resumo.totalDespesas)}</p><p className="text-[9px] text-muted-foreground">Despesas</p></div>}
                    <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold">{fmtK(drillData.resumo.maiorTransacao)}</p><p className="text-[9px] text-muted-foreground">Maior transação</p></div>
                  </div>

                  {/* Mini-tendência */}
                  {drillData.tendencia?.length > 1 && (
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={drillData.tendencia}>
                        <XAxis dataKey="mes" fontSize={9} tickFormatter={(m) => m.slice(5)} />
                        <YAxis fontSize={9} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmt(v)} />
                        <Area dataKey="valor" stroke="#0d9488" fill="#0d948833" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {/* Transações */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-card"><tr className="border-b"><th className="p-2 text-left">Data</th><th className="p-2 text-left">Descrição</th><th className="p-2 text-right">Valor</th><th className="p-2 text-center">Status</th></tr></thead>
                      <tbody>
                        {drillData.transacoes.map((t: any) => (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-2 whitespace-nowrap">{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                            <td className="p-2 max-w-[280px] truncate">{t.descricao}{t.paciente && <span className="text-primary"> · {t.paciente}</span>}</td>
                            <td className={`p-2 text-right font-medium ${t.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"}`}>{t.tipo === "RECEITA" ? "+" : "-"}{fmt(t.valor)}</td>
                            <td className="p-2 text-center"><Badge variant="outline" className="text-[8px]">{t.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {drillData.transacoes.length >= 200 && <p className="text-[10px] text-muted-foreground text-center py-2">Mostrando primeiras 200 transações</p>}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">Sem dados.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ COMPONENTS ═══
function Metric({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = { emerald: "text-emerald-600", red: "text-red-600", amber: "text-amber-600", blue: "text-blue-600", primary: "text-primary" };
  return <Card><CardContent className="p-3 text-center"><Icon className={`h-4 w-4 mx-auto mb-1 ${colors[color]}`} /><p className={`text-lg font-bold ${colors[color]}`}>{value}</p><p className="text-[9px] text-muted-foreground">{label}</p></CardContent></Card>;
}
function DRELine({ label, value, bold, indent, positive, negative, highlight }: any) {
  const f = (v: number) => `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  return <div className={`flex items-center justify-between py-1.5 px-3 rounded ${highlight ? "bg-primary/5 border border-primary/10" : ""} ${indent ? "pl-6" : ""}`}><span className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span><span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${positive ? "text-emerald-600" : negative ? "text-red-600" : ""}`}>{value < 0 ? "-" : ""}{f(value)}</span></div>;
}
function DREBadge({ label, value, good }: { label: string; value: string; good: boolean }) {
  return <div className="flex items-center justify-between text-xs px-6 py-0.5"><span className="text-muted-foreground">{label}</span><Badge variant={good ? "default" : "destructive"} className="text-[9px]">{value}</Badge></div>;
}
function AgingBar({ label, value, count, total, color }: any) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const f = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const bg: Record<string, string> = { emerald: "bg-emerald-500", amber: "bg-amber-500", orange: "bg-orange-500", red: "bg-red-500" };
  return <div><div className="flex items-center justify-between mb-1"><span className="text-xs font-medium">{label} <span className="text-muted-foreground">({count})</span></span><span className="text-xs font-medium">{f(value)}</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${bg[color]}`} style={{ width: `${pct}%` }} /></div></div>;
}
function IndexCard({ label, value, good }: { label: string; value: string; good: boolean }) {
  return <div className={`p-3 rounded-lg border ${good ? "border-emerald-200/50 bg-emerald-50/30" : "border-red-200/50 bg-red-50/30"}`}><p className="text-[10px] text-muted-foreground">{label}</p><p className={`text-lg font-bold ${good ? "text-emerald-600" : "text-red-600"}`}>{value}</p></div>;
}

// Monthly performance heatmap
function Heatmap({ periodos, fmt }: { periodos: any[]; fmt: (v: number) => string }) {
  const maxAbs = Math.max(...periodos.map((p: any) => Math.abs(p.resultado || 0)), 1);
  return (
    <div className="flex flex-wrap gap-2">
      {periodos.map((p: any, i: number) => {
        const r = p.resultado || 0;
        const intensity = Math.min(1, Math.abs(r) / maxAbs);
        const bg = r >= 0
          ? `rgba(13, 148, 136, ${0.15 + intensity * 0.75})`
          : `rgba(239, 68, 68, ${0.15 + intensity * 0.75})`;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:scale-105 cursor-default"
              style={{ background: bg }}
              title={`${p.periodo}: ${fmt(r)}`}
            >
              {r >= 0 ? "+" : "-"}{Math.abs(Math.round(r / 1000))}k
            </div>
            <span className="text-[9px] text-muted-foreground">{p.periodo}</span>
          </div>
        );
      })}
    </div>
  );
}

// Build waterfall chart data: cumulative running balance with monthly gains/losses
function buildWaterfall(periodos: any[]): any[] {
  let acumulado = 0;
  return periodos.map((p) => {
    const resultado = p.resultado || 0;
    const base = resultado >= 0 ? acumulado : acumulado + resultado;
    const item = {
      periodo: p.periodo,
      base: Math.max(0, base),
      ganho: resultado >= 0 ? resultado : 0,
      perda: resultado < 0 ? Math.abs(resultado) : 0,
      acumulado: acumulado + resultado,
    };
    acumulado += resultado;
    return item;
  });
}
