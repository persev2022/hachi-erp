"use client";

import * as React from "react";
import { Loader2, TrendingUp, TrendingDown, Users, Building, CreditCard, Activity, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AnaliseProfundaPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/financeiro/analise-profunda").then(r => r.json()).then(d => { if (d.success) setData(d.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!data) return <div className="p-8 text-muted-foreground">Sem dados financeiros para análise.</div>;

  const { resumo, topPagadores, topCredores, centrosCusto, fluxoSemanal, metodosPagamento } = data;
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análise Financeira Profunda</h1>
          <p className="text-sm text-muted-foreground">Inteligência de dados · Pagadores · Centros de Custo · Fluxo de Caixa</p>
        </div>
        <Button variant="outline" size="sm" asChild><Link href="/financeiro/dashboard">← Dashboard</Link></Button>
      </div>

      {/* Health Score + Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className={`${resumo.healthScore >= 70 ? "border-emerald-200 bg-emerald-50" : resumo.healthScore >= 40 ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
          <CardContent className="p-4 text-center">
            <Shield className={`h-5 w-5 mx-auto mb-1 ${resumo.healthScore >= 70 ? "text-emerald-600" : resumo.healthScore >= 40 ? "text-amber-600" : "text-red-600"}`} />
            <p className="text-2xl font-bold">{resumo.healthScore}</p>
            <p className="text-[10px] text-muted-foreground">Saúde Financeira</p>
          </CardContent>
        </Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Receitas</p><p className="text-lg font-bold text-emerald-600">{fmt(resumo.totalReceitas)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Despesas</p><p className="text-lg font-bold text-red-600">{fmt(resumo.totalDespesas)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Margem</p><p className={`text-lg font-bold ${resumo.margem >= 0 ? "text-emerald-600" : "text-red-600"}`}>{resumo.margem}%</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Risco Concentração</p><p className={`text-lg font-bold ${resumo.concentracaoRisco > 50 ? "text-amber-600" : "text-emerald-600"}`}>{resumo.concentracaoRisco}%</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pagadores */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> Top Pagadores (Receitas)</CardTitle></CardHeader>
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
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-600" /> Top Credores (Despesas)</CardTitle></CardHeader>
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
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4 text-primary" /> Centros de Custo</CardTitle></CardHeader>
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
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Métodos de Pagamento</CardTitle></CardHeader>
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
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Fluxo de Caixa Semanal</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="p-2 text-left">Semana</th><th className="p-2 text-right text-emerald-600">Receitas</th><th className="p-2 text-right text-red-600">Despesas</th><th className="p-2 text-right">Resultado</th></tr></thead>
              <tbody>
                {fluxoSemanal.map((s: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 font-medium">{new Date(s.semana).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</td>
                    <td className="p-2 text-right text-emerald-600">{fmt(s.receitas)}</td>
                    <td className="p-2 text-right text-red-600">{fmt(s.despesas)}</td>
                    <td className={`p-2 text-right font-bold ${s.resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(s.resultado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3"><CardTitle className="text-base">🧠 Insights Automáticos</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {resumo.concentracaoRisco > 50 && <p>⚠️ <strong>Alto risco de concentração:</strong> Os 3 maiores pagadores representam {resumo.concentracaoRisco}% da receita. Diversifique.</p>}
          {resumo.margem < 10 && <p>⚠️ <strong>Margem apertada:</strong> Apenas {resumo.margem}% de margem operacional. Revise custos.</p>}
          {resumo.margem >= 30 && <p>✅ <strong>Margem saudável:</strong> {resumo.margem}% de margem operacional. Boa gestão de custos.</p>}
          <p>📊 <strong>Média diária:</strong> Receita R$ {resumo.mediaReceitaDia}/dia vs Despesa R$ {resumo.mediaDespesaDia}/dia</p>
          <p>📅 <strong>Período analisado:</strong> {resumo.diasAnalisados} dias, {resumo.transacoes} transações</p>
        </CardContent>
      </Card>
    </div>
  );
}
