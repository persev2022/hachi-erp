"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Users,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Wallet,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface DashboardData {
  periodos: {
    periodo: string;
    mes: number;
    ano: number;
    previsto: number;
    realizado: number;
    taxaRecebimento: number;
    pendente: number;
    qtdPendentes: number;
    despesas: number;
    despesasPagas: number;
    resultado: number;
    pacientesAtivos: number;
  }[];
  projecao: {
    periodo: string;
    receitaPrevista: number;
    receitaProjetada: number;
    despesaProjetada: number;
    resultadoProjetado: number;
  }[];
  resumoMesAtual: {
    previsto: number;
    realizado: number;
    taxaRecebimento: number;
    pendente: number;
    despesas: number;
    resultado: number;
    pacientesAtivos: number;
    variacaoReceita: number;
    variacaoDespesa: number;
  };
  inadimplencia: {
    total: number;
    quantidade: number;
    topDevedores: { pacienteId: string; nome: string; totalDevido: number; qtdParcelas: number }[];
    detalhes: { id: string; paciente: string; valor: number; vencimento: string; descricao: string }[];
  };
  categorias: {
    receitas: { categoria: string; total: number; quantidade: number }[];
    despesas: { categoria: string; total: number; quantidade: number }[];
  };
  kpis: {
    receitaProjetadaMensal: number;
    mediaTaxaRecebimento: number;
    totalPrevistoAno: number;
    totalRealizadoAno: number;
    totalDespesasAno: number;
    margemOperacional: number;
    ticketMedio: number;
  };
}

const COLORS = ["#0D9488", "#2563EB", "#7C3AED", "#F59E0B", "#DC2626", "#10B981", "#6366F1", "#EC4899", "#14B8A6"];
const categoriaLabels: Record<string, string> = {
  MENSALIDADE: "Mensalidade",
  MATRICULA: "Matrícula",
  MEDICAMENTO: "Medicamento",
  ALIMENTACAO: "Alimentação",
  TRANSPORTE: "Transporte",
  LAVANDERIA: "Lavanderia",
  EXAME: "Exame",
  PROCEDIMENTO: "Procedimento",
  OUTRO: "Outro",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatCurrencyFull(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; }
}

export default function DashboardFinanceiroPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [meses, setMeses] = React.useState("12");

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/financeiro/dashboard-avancado?meses=${meses}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [meses]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dashboard financeiro...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Erro ao carregar dados financeiros</p>
      </div>
    );
  }

  const { resumoMesAtual: resumo, kpis, inadimplencia, periodos, projecao, categorias } = data;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão completa — Previsto × Realizado • Projeções • Inadimplência
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={meses}
            onChange={(e) => setMeses(e.target.value)}
            className="text-sm border rounded-md px-3 py-2 bg-background"
          >
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
          </select>
          <Button variant="outline" size="sm" asChild>
            <Link href="/financeiro">Ver Movimentações</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard
          label="Previsto (mês)"
          value={formatCurrency(resumo.previsto)}
          icon={Target}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <KPICard
          label="Realizado (mês)"
          value={formatCurrency(resumo.realizado)}
          icon={DollarSign}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
          badge={resumo.variacaoReceita !== 0 ? {
            value: `${resumo.variacaoReceita > 0 ? "+" : ""}${resumo.variacaoReceita}%`,
            positive: resumo.variacaoReceita > 0,
          } : undefined}
        />
        <KPICard
          label="Taxa Recebimento"
          value={`${resumo.taxaRecebimento}%`}
          icon={Activity}
          color={resumo.taxaRecebimento >= 80 ? "text-emerald-600" : resumo.taxaRecebimento >= 50 ? "text-amber-600" : "text-red-600"}
          bgColor={resumo.taxaRecebimento >= 80 ? "bg-emerald-100" : resumo.taxaRecebimento >= 50 ? "bg-amber-100" : "bg-red-100"}
        />
        <KPICard
          label="Inadimplência"
          value={formatCurrency(inadimplencia.total)}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-100"
          subtitle={`${inadimplencia.quantidade} parcela(s)`}
        />
        <KPICard
          label="Resultado (mês)"
          value={formatCurrency(resumo.resultado)}
          icon={resumo.resultado >= 0 ? TrendingUp : TrendingDown}
          color={resumo.resultado >= 0 ? "text-emerald-600" : "text-red-600"}
          bgColor={resumo.resultado >= 0 ? "bg-emerald-100" : "bg-red-100"}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Acolhidos Ativos</p>
          <p className="text-xl font-bold mt-1">{resumo.pacientesAtivos}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Ticket Médio</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(kpis.ticketMedio)}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Margem Operacional</p>
          <p className={`text-xl font-bold mt-1 ${kpis.margemOperacional >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {kpis.margemOperacional}%
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Recebimento Médio</p>
          <p className="text-xl font-bold mt-1">{kpis.mediaTaxaRecebimento}%</p>
        </div>
      </div>

      {/* Main Chart: Previsto vs Realizado */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Previsto × Realizado (Receitas)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend />
                <Bar dataKey="previsto" name="Previsto" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realizado" name="Realizado" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Resultado Mensal (Linha) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Resultado Mensal (Lucro/Prejuízo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [formatCurrencyFull(value), "Resultado"]} />
                  <defs>
                    <linearGradient id="resultGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="resultado"
                    stroke="#10B981"
                    fill="url(#resultGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Recebimento (Linha) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" /> Taxa de Recebimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={periodos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Taxa"]} />
                  <Line
                    type="monotone"
                    dataKey="taxaRecebimento"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#2563EB" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projeção */}
      {projecao.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Projeção Próximos 3 Meses
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Baseado na taxa média de recebimento ({kpis.mediaTaxaRecebimento}%) e média de despesas
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projecao.map((p) => (
                <div key={p.periodo} className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-center uppercase">{p.periodo}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receita prevista:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(p.receitaPrevista)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receita projetada:</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(p.receitaProjetada)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Despesa projetada:</span>
                      <span className="font-medium text-red-600">{formatCurrency(p.despesaProjetada)}</span>
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-between">
                      <span className="font-medium">Resultado:</span>
                      <span className={`font-bold ${p.resultadoProjetado >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatCurrency(p.resultadoProjetado)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories + Inadimplência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Receita por Categoria (Pie) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Receitas por Categoria (Ano)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categorias.receitas.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-[200px] w-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorias.receitas.map((c) => ({ name: categoriaLabels[c.categoria] || c.categoria, value: c.total }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        strokeWidth={2}
                      >
                        {categorias.receitas.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrencyFull(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 flex-1">
                  {categorias.receitas.map((c, i) => (
                    <div key={c.categoria} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{categoriaLabels[c.categoria] || c.categoria}</span>
                      <span className="ml-auto font-medium">{formatCurrency(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados de receita no período</p>
            )}
          </CardContent>
        </Card>

        {/* Despesas por Categoria (Pie) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Despesas por Categoria (Ano)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categorias.despesas.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-[200px] w-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorias.despesas.map((c) => ({ name: categoriaLabels[c.categoria] || c.categoria, value: c.total }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        strokeWidth={2}
                      >
                        {categorias.despesas.map((_, i) => (
                          <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrencyFull(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 flex-1">
                  {categorias.despesas.map((c, i) => (
                    <div key={c.categoria} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[(i + 4) % COLORS.length] }} />
                      <span className="text-muted-foreground">{categoriaLabels[c.categoria] || c.categoria}</span>
                      <span className="ml-auto font-medium">{formatCurrency(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados de despesa no período</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inadimplência detalhada */}
      {inadimplencia.quantidade > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Inadimplência Detalhada
              </CardTitle>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {formatCurrencyFull(inadimplencia.total)} em aberto
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Devedores */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Top Devedores</h3>
                <div className="space-y-2">
                  {inadimplencia.topDevedores.map((d, i) => (
                    <div key={d.pacienteId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                        <div>
                          <p className="text-sm font-medium">{d.nome}</p>
                          <p className="text-xs text-muted-foreground">{d.qtdParcelas} parcela(s) atrasada(s)</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-red-600">{formatCurrencyFull(d.totalDevido)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parcelas Atrasadas */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Parcelas Atrasadas (recentes)</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {inadimplencia.detalhes.slice(0, 10).map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{d.paciente}</p>
                        <p className="text-xs text-muted-foreground">{d.descricao} • Venc: {formatDate(d.vencimento)}</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">{formatCurrencyFull(d.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year-to-date Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Resumo Acumulado ({meses} meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <p className="text-xs text-muted-foreground">Total Previsto</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(kpis.totalPrevistoAno)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <p className="text-xs text-muted-foreground">Total Realizado</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(kpis.totalRealizadoAno)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="text-xs text-muted-foreground">Total Despesas</p>
              <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(kpis.totalDespesasAno)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <p className="text-xs text-muted-foreground">Lucro Líquido</p>
              <p className={`text-lg font-bold mt-1 ${(kpis.totalRealizadoAno - kpis.totalDespesasAno) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(kpis.totalRealizadoAno - kpis.totalDespesasAno)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// KPI Card component
function KPICard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  badge,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  badge?: { value: string; positive: boolean };
  subtitle?: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className={`text-lg md:text-xl font-bold mt-1 truncate ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          {badge && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium mt-1 ${badge.positive ? "text-emerald-600" : "text-red-600"}`}>
              {badge.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {badge.value} vs mês anterior
            </span>
          )}
        </div>
        <div className={`h-9 w-9 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
    </div>
  );
}
