"use client";

import * as React from "react";
import { BarChart3, TrendingUp, Users, BedDouble, DollarSign, Calendar, Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";

interface DashboardKpis {
  pacientesAtivos: number;
  ocupacao: number;
  agendamentosHoje: number;
  receitaMes: number;
  inadimplentes: number;
  evolucoesPendentes: number;
  estoqueBaixo: number;
}

export default function RelatoriosPage() {
  const { show } = useToast();
  const [kpis, setKpis] = React.useState<DashboardKpis | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState("");
  const [periodo, setPeriodo] = React.useState("6");
  const [finData, setFinData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/relatorios/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setKpis(d.data.kpis); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetch(`/api/relatorios/financeiro?meses=${periodo}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setFinData(d.data); })
      .catch(() => {});
  }, [periodo]);

  const handleExport = async (tipo: string) => {
    setExporting(tipo);
    try {
      const res = await fetch(`/api/relatorios/exportar?tipo=${tipo}&formato=xlsx`);
      if (!res.ok) { show("Erro ao exportar", "error"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipo}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      show("Exportação concluída!", "success");
    } catch { show("Erro ao exportar", "error"); }
    finally { setExporting(""); }
  };

  const kpiCards = kpis ? [
    { label: "Pacientes Ativos", value: String(kpis.pacientesAtivos), icon: Users, color: "text-blue-600" },
    { label: "Taxa de Ocupação", value: `${kpis.ocupacao}%`, icon: BedDouble, color: "text-emerald-600" },
    { label: "Consultas Hoje", value: String(kpis.agendamentosHoje), icon: Calendar, color: "text-indigo-600" },
    { label: "Receita Mensal", value: `R$ ${(kpis.receitaMes / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-amber-600" },
    { label: "Inadimplentes", value: String(kpis.inadimplentes), icon: TrendingUp, color: "text-red-600" },
    { label: "Evoluções Pendentes", value: String(kpis.evolucoesPendentes), icon: BarChart3, color: "text-purple-600" },
  ] : [];

  const relatorios = [
    { id: "ocupacao", nome: "Relatório de Ocupação", desc: "Taxa de ocupação por quarto e período", cat: "Operacional", exportTipo: "ocupacao" },
    { id: "financeiro", nome: "DRE / Fluxo de Caixa", desc: "Receitas vs despesas por período", cat: "Financeiro", exportTipo: "financeiro" },
    { id: "pacientes", nome: "Listagem de Pacientes", desc: "Dados cadastrais e status de todos os pacientes", cat: "Operacional", exportTipo: "pacientes" },
    { id: "clinico", nome: "Relatório Clínico", desc: "Adesão ao tratamento e evoluções", cat: "Clínico", exportTipo: null },
    { id: "sisnad", nome: "Relatório SISNAD", desc: "Dados para o Sistema Nacional de Drogas", cat: "Compliance", exportTipo: null },
  ];

  const catColors: Record<string, string> = {
    Operacional: "bg-blue-100 text-blue-700 border-blue-200",
    Financeiro: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Clínico: "bg-purple-100 text-purple-700 border-purple-200",
    Compliance: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Relatórios & BI</h1>
        <p className="text-sm text-muted-foreground mt-1">Indicadores de performance e exportação de dados</p>
      </div>

      {/* PDF Export Buttons */}
      <div className="flex flex-wrap gap-2">
        <a href="/api/relatorios/pdf?type=financeiro" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition">
          <FileText className="h-4 w-4" /> Financeiro (PDF)
        </a>
        <a href="/api/relatorios/pdf?type=ocupacao" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition">
          <FileText className="h-4 w-4" /> Ocupação (PDF)
        </a>
        <a href="/api/relatorios/pdf?type=clinico" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition">
          <FileText className="h-4 w-4" /> Clínico (PDF)
        </a>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold mt-1">{kpi.value}</p>
                </div>
                <kpi.icon className={`h-5 w-5 ${kpi.color} opacity-70`} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Export buttons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Exportar Dados (Excel)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["pacientes", "financeiro", "ocupacao"].map((tipo) => (
            <Button
              key={tipo}
              variant="outline"
              size="sm"
              disabled={exporting === tipo}
              onClick={() => handleExport(tipo)}
            >
              {exporting === tipo ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Financial chart with period filter */}
      {finData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Receita vs Despesa</CardTitle>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="text-xs border rounded px-2 py-1 bg-background"
              >
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-1 px-2">
              {finData.periodos.map((p: any) => {
                const maxVal = Math.max(...finData.periodos.map((x: any) => Math.max(x.receitas, x.despesas)), 1);
                return (
                  <div key={p.periodo} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 h-36">
                      <div className="flex-1 bg-emerald-400 dark:bg-emerald-600 rounded-t transition-all" style={{ height: `${(p.receitas / maxVal) * 100}%` }} title={`R$ ${p.receitas.toFixed(0)}`} />
                      <div className="flex-1 bg-red-300 dark:bg-red-500 rounded-t transition-all" style={{ height: `${(p.despesas / maxVal) * 100}%` }} title={`R$ ${p.despesas.toFixed(0)}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{p.periodo}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center text-xs">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-400" />Receita</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-300" />Despesa</span>
            </div>
            {finData.resumo && (
              <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
                <div><p className="font-bold text-emerald-600">R$ {finData.resumo.totalReceitas.toFixed(0)}</p><p className="text-muted-foreground">Total receitas</p></div>
                <div><p className="font-bold text-red-600">R$ {finData.resumo.totalDespesas.toFixed(0)}</p><p className="text-muted-foreground">Total despesas</p></div>
                <div><p className={`font-bold ${finData.resumo.resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>R$ {finData.resumo.resultado.toFixed(0)}</p><p className="text-muted-foreground">Resultado</p></div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reports list */}
      <div>
        <h2 className="font-semibold mb-3">Relatórios Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {relatorios.map((rel) => (
            <div key={rel.id} className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{rel.nome}</p>
                  <Badge variant="outline" className={catColors[rel.cat]}>{rel.cat}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{rel.desc}</p>
              </div>
              {rel.exportTipo ? (
                <Button variant="outline" size="sm" disabled={exporting === rel.exportTipo} onClick={() => handleExport(rel.exportTipo!)}>
                  {exporting === rel.exportTipo ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                  Excel
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => {
                  window.open(`/api/relatorios/${rel.id}`, "_blank");
                  show("Relatório aberto em nova aba (JSON)", "success");
                }}>
                  <Download className="h-3 w-3 mr-1" />Ver
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
