"use client";

import * as React from "react";
import {
  Loader2, TrendingUp, TrendingDown, Users, Building, CreditCard,
  Activity, Shield, AlertTriangle, BarChart3, Target, Clock,
  Flame, Repeat, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AnaliseProfundaPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

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
      <p className="text-sm text-muted-foreground">Processando análise financeira profunda...</p>
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
    pontoEquilibrio, comparativoMensal, anomalias, recorrentes
  } = data;

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const fmtK = (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : fmt(v);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análise Financeira Profunda</h1>
          <p className="text-sm text-muted-foreground">
            Enterprise Intelligence · DRE · Burn Rate · Anomalias · Centros de Custo
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/financeiro/dashboard">← Dashboard</Link>
        </Button>
      </div>

      {/* ═══════════ HEALTH SCORE + KEY METRICS ═══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className={`${resumo.healthScore >= 70 ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : resumo.healthScore >= 40 ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
          <CardContent className="p-4 text-center">
            <Shield className={`h-6 w-6 mx-auto mb-1 ${resumo.healthScore >= 70 ? "text-emerald-600" : resumo.healthScore >= 40 ? "text-amber-600" : "text-red-600"}`} />
            <p className="text-3xl font-bold">{resumo.healthScore}</p>
            <p className="text-[10px] text-muted-foreground font-medium">SAÚDE FINANCEIRA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ArrowUpRight className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
            <p className="text-lg font-bold text-emerald-600">{fmtK(resumo.totalReceitas)}</p>
            <p className="text-[10px] text-muted-foreground">Receitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ArrowDownRight className="h-4 w-4 mx-auto mb-1 text-red-600" />
            <p className="text-lg font-bold text-red-600">{fmtK(resumo.totalDespesas)}</p>
            <p className="text-[10px] text-muted-foreground">Despesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className={`text-lg font-bold ${resumo.margem >= 0 ? "text-emerald-600" : "text-red-600"}`}>{resumo.margem}%</p>
            <p className="text-[10px] text-muted-foreground">Margem</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-amber-600" />
            <p className={`text-lg font-bold ${resumo.concentracaoRisco > 50 ? "text-amber-600" : "text-emerald-600"}`}>{resumo.concentracaoRisco}%</p>
            <p className="text-[10px] text-muted-foreground">Concentração</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ DRE — DEMONSTRATIVO DE RESULTADO ═══════════ */}
      {dre && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              DRE — Demonstrativo de Resultado do Exercício
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <DRELine label="Receita Bruta" value={dre.receitaBruta} bold positive />
              <DRELine label="(-) Deduções da Receita" value={dre.deducoesReceita} indent negative />
              <DRELine label="= Receita Líquida" value={dre.receitaLiquida} bold highlight />
              <div className="border-t my-2" />
              <DRELine label="(-) Custos Diretos (CMV)" value={dre.custosDiretos} indent negative />
              <DRELine label="= Lucro Bruto" value={dre.lucroBruto} bold positive />
              <div className="flex items-center justify-between text-xs text-muted-foreground pl-4">
                <span>Margem Bruta</span>
                <Badge variant="outline" className="text-[10px]">{dre.margemBruta}%</Badge>
              </div>
              <div className="border-t my-2" />
              <DRELine label="(-) Despesas Operacionais" value={dre.despesasOperacionais} indent negative />
              <DRELine label="= Lucro Operacional (EBIT)" value={dre.lucroOperacional} bold positive={dre.lucroOperacional >= 0} negative={dre.lucroOperacional < 0} />
              <div className="flex items-center justify-between text-xs text-muted-foreground pl-4">
                <span>Margem Operacional</span>
                <Badge variant="outline" className="text-[10px]">{dre.margemOperacional}%</Badge>
              </div>
              <div className="border-t my-2" />
              <DRELine label="(-) Despesas Financeiras" value={dre.despesasFinanceiras} indent negative />
              <DRELine label="= Lucro Líquido" value={dre.lucroLiquido} bold positive={dre.lucroLiquido >= 0} negative={dre.lucroLiquido < 0} highlight />
              <div className="flex items-center justify-between text-xs text-muted-foreground pl-4">
                <span>Margem Líquida</span>
                <Badge variant={dre.margemLiquida >= 0 ? "default" : "destructive"} className="text-[10px]">{dre.margemLiquida}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════ BURN RATE + RUNWAY + PONTO DE EQUILÍBRIO ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {burnRate && (
          <Card className="border-orange-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Burn Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-lg font-bold text-red-600">{fmtK(burnRate.mensal)}</p>
                  <p className="text-[10px] text-muted-foreground">Gasto/mês</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <p className="text-lg font-bold text-emerald-600">{fmtK(burnRate.receitaMensal)}</p>
                  <p className="text-[10px] text-muted-foreground">Receita/mês</p>
                </div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className={`text-xl font-bold ${burnRate.burnLiquido > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {burnRate.burnLiquido > 0 ? "-" : "+"}{fmtK(Math.abs(burnRate.burnLiquido))}
                </p>
                <p className="text-[10px] text-muted-foreground">Burn Líquido/mês</p>
              </div>
            </CardContent>
          </Card>
        )}

        {burnRate && (
          <Card className={`${burnRate.runwayDias < 90 ? "border-red-200" : burnRate.runwayDias < 180 ? "border-amber-200" : "border-emerald-200"}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Runway
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              {burnRate.runwayDias >= 999 ? (
                <>
                  <p className="text-3xl font-bold text-emerald-600">∞</p>
                  <p className="text-sm text-emerald-600 font-medium">Sustentável</p>
                  <p className="text-xs text-muted-foreground">Receita cobre despesas — runway infinito</p>
                </>
              ) : (
                <>
                  <p className={`text-3xl font-bold ${burnRate.runwayDias < 90 ? "text-red-600" : burnRate.runwayDias < 180 ? "text-amber-600" : "text-emerald-600"}`}>
                    {burnRate.runwayMeses} meses
                  </p>
                  <p className="text-xs text-muted-foreground">{burnRate.runwayDias} dias até ficar sem caixa</p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${burnRate.runwayDias < 90 ? "bg-red-500" : burnRate.runwayDias < 180 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, (burnRate.runwayDias / 365) * 100)}%` }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {pontoEquilibrio && (
          <Card className="border-blue-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" /> Ponto de Equilíbrio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{pontoEquilibrio.pacientesNecessarios}</p>
                <p className="text-xs text-muted-foreground">pacientes para break-even</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo Fixo/mês</span>
                  <span className="font-medium">{fmtK(pontoEquilibrio.custoFixoMensal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo Var./paciente</span>
                  <span className="font-medium">{fmtK(pontoEquilibrio.custoVariavelPorPaciente)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Médio</span>
                  <span className="font-medium">{fmtK(pontoEquilibrio.ticketMedio)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════════ COMPARATIVO MENSAL ═══════════ */}
      {comparativoMensal && comparativoMensal.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Comparativo Mês a Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Mês</th>
                    <th className="p-2 text-right font-medium text-emerald-600">Receitas</th>
                    <th className="p-2 text-right font-medium text-red-600">Despesas</th>
                    <th className="p-2 text-right font-medium">Resultado</th>
                    <th className="p-2 text-right font-medium">Margem</th>
                    <th className="p-2 text-center font-medium">Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativoMensal.map((m: any, i: number) => {
                    const prev = i > 0 ? comparativoMensal[i - 1] : null;
                    const variacao = prev && prev.receitas > 0 ? Math.round(((m.receitas - prev.receitas) / prev.receitas) * 100) : null;
                    return (
                      <tr key={m.mes} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-2 font-medium">{formatMonth(m.mes)}</td>
                        <td className="p-2 text-right text-emerald-600">{fmt(m.receitas)}</td>
                        <td className="p-2 text-right text-red-600">{fmt(m.despesas)}</td>
                        <td className={`p-2 text-right font-bold ${m.resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {fmt(m.resultado)}
                        </td>
                        <td className="p-2 text-right">
                          <Badge variant={m.margem >= 0 ? "default" : "destructive"} className="text-[10px]">
                            {m.margem}%
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          {variacao !== null ? (
                            <span className={`text-[10px] font-medium ${variacao >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {variacao >= 0 ? "↑" : "↓"} {Math.abs(variacao)}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
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

      {/* ═══════════ ANOMALIAS ═══════════ */}
      {anomalias && anomalias.length > 0 && (
        <Card className="border-amber-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Anomalias Detectadas
              <Badge variant="outline" className="text-[10px] ml-auto">{anomalias.length} encontradas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {anomalias.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30">
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

      {/* ═══════════ TRANSAÇÕES RECORRENTES ═══════════ */}
      {recorrentes && recorrentes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" /> Transações Recorrentes
              <Badge variant="outline" className="text-[10px] ml-auto">{recorrentes.length} identificadas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recorrentes.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50">
                  <p className="text-xs font-medium truncate max-w-[220px]">{r.descricao}</p>
                  <Badge variant="secondary" className="text-[10px]">{r.frequencia}x</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pagadores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Top Pagadores (Receitas)
              <Badge variant="outline" className="text-[10px] ml-auto">{topPagadores.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {topPagadores.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{p.nome}</p>
                      <p className="text-[10px] text-muted-foreground">{p.count}x · último: {p.lastDate}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">{fmt(p.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Credores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" /> Top Credores (Despesas)
              <Badge variant="outline" className="text-[10px] ml-auto">{topCredores.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {topCredores.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{c.nome}</p>
                      <p className="text-[10px] text-muted-foreground">{c.count}x · {c.categoria}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-red-600">{fmt(c.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Centros de Custo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Centros de Custo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {centrosCusto.map((cc: any, i: number) => {
                const pct = resumo.totalDespesas > 0 ? Math.round((cc.total / resumo.totalDespesas) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{cc.nome}</span>
                      <span className="text-xs text-muted-foreground">{fmt(cc.total)} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metodosPagamento.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{m.nome}</Badge>
                    <span className="text-xs text-muted-foreground">{m.count} transações</span>
                  </div>
                  <p className="text-sm font-medium">{fmt(m.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Cash Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Fluxo de Caixa Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Semana</th>
                  <th className="p-2 text-right text-emerald-600">Receitas</th>
                  <th className="p-2 text-right text-red-600">Despesas</th>
                  <th className="p-2 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {fluxoSemanal.map((s: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 font-medium">
                      {new Date(s.semana).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="p-2 text-right text-emerald-600">{fmt(s.receitas)}</td>
                    <td className="p-2 text-right text-red-600">{fmt(s.despesas)}</td>
                    <td className={`p-2 text-right font-bold ${s.resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {fmt(s.resultado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🧠 Insights Automáticos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {resumo.concentracaoRisco > 50 && (
            <p>⚠️ <strong>Alto risco de concentração:</strong> Os 3 maiores pagadores representam {resumo.concentracaoRisco}% da receita. Diversifique.</p>
          )}
          {resumo.margem < 10 && resumo.margem >= 0 && (
            <p>⚠️ <strong>Margem apertada:</strong> Apenas {resumo.margem}% de margem operacional. Revise custos.</p>
          )}
          {resumo.margem < 0 && (
            <p>🚨 <strong>Operação deficitária:</strong> Margem negativa de {resumo.margem}%. Ação urgente necessária.</p>
          )}
          {resumo.margem >= 30 && (
            <p>✅ <strong>Margem saudável:</strong> {resumo.margem}% de margem operacional. Boa gestão de custos.</p>
          )}
          {burnRate && burnRate.burnLiquido <= 0 && (
            <p>✅ <strong>Cash flow positivo:</strong> Receita supera despesas em {fmtK(Math.abs(burnRate.burnLiquido))}/mês.</p>
          )}
          {burnRate && burnRate.burnLiquido > 0 && burnRate.runwayDias < 180 && (
            <p>🚨 <strong>Runway crítico:</strong> Apenas {burnRate.runwayMeses} meses de caixa restante. Reduza burn rate.</p>
          )}
          {pontoEquilibrio && pontoEquilibrio.pacientesNecessarios > 0 && (
            <p>📊 <strong>Break-even:</strong> Necessários {pontoEquilibrio.pacientesNecessarios} pacientes pagantes para cobrir custos fixos.</p>
          )}
          {anomalias && anomalias.length > 0 && (
            <p>⚠️ <strong>Anomalias:</strong> {anomalias.length} transação(ões) fora do padrão identificadas. Revise na seção acima.</p>
          )}
          <p>📊 <strong>Média diária:</strong> Receita R$ {resumo.mediaReceitaDia}/dia vs Despesa R$ {resumo.mediaDespesaDia}/dia</p>
          <p>📅 <strong>Período analisado:</strong> {resumo.diasAnalisados} dias, {resumo.transacoes} transações</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══ HELPER COMPONENTS ═══

function DRELine({ label, value, bold, indent, positive, negative, highlight }: {
  label: string; value: number; bold?: boolean; indent?: boolean; positive?: boolean; negative?: boolean; highlight?: boolean;
}) {
  const fmt = (v: number) => `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  return (
    <div className={`flex items-center justify-between py-1 px-2 rounded ${highlight ? "bg-primary/5" : ""} ${indent ? "pl-6" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${positive ? "text-emerald-600" : negative ? "text-red-600" : ""}`}>
        {value < 0 ? "-" : ""}{fmt(value)}
      </span>
    </div>
  );
}

function formatMonth(mes: string): string {
  const [year, month] = mes.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
}
