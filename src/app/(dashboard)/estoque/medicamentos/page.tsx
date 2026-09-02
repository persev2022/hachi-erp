"use client";

import * as React from "react";
import Link from "next/link";
import {
  Pill, Users, Loader2, Search, AlertTriangle, ArrowLeft, Clock,
  TrendingDown, CheckCircle2, PackageX, Calendar, Activity, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

export default function MedicamentosPorAcolhidoPage() {
  const terms = useTerminology();
  const { show } = useToast();
  const [resumo, setResumo] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busca, setBusca] = React.useState("");
  const [filtro, setFiltro] = React.useState<"todos" | "repor" | "ativos">("todos");
  const [expandido, setExpandido] = React.useState<string | null>(null);
  const [historico, setHistorico] = React.useState<Record<string, any[]>>({});

  const fetchResumo = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/estoque/dispensar?resumo=true");
      const d = await res.json();
      if (d.success) setResumo(d.data);
    } catch { show("Erro ao carregar", "error"); }
    finally { setLoading(false); }
  }, [show]);

  React.useEffect(() => { fetchResumo(); }, [fetchResumo]);

  const loadHistorico = async (pacienteId: string) => {
    if (expandido === pacienteId) { setExpandido(null); return; }
    setExpandido(pacienteId);
    if (!historico[pacienteId]) {
      try {
        const res = await fetch(`/api/estoque/dispensar?pacienteId=${pacienteId}`);
        const d = await res.json();
        if (d.success) setHistorico(prev => ({ ...prev, [pacienteId]: d.data }));
      } catch {}
    }
  };

  // Filtered list
  const filtered = resumo.filter((r: any) => {
    if (busca && !r.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtro === "repor") return r.precisaRepor;
    if (filtro === "ativos") return r.medicamentos.some((m: any) => m.consumoDiario > 0 && m.restante > 0);
    return true;
  });

  // Summary stats
  const totalAcolhidos = resumo.length;
  const precisamRepor = resumo.filter((r: any) => r.precisaRepor).length;
  const totalMedicamentos = resumo.reduce((s: number, r: any) => s + r.medicamentos.length, 0);
  const emUso = resumo.reduce((s: number, r: any) => s + r.medicamentos.filter((m: any) => m.consumoDiario > 0 && m.restante > 0).length, 0);

  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
    } catch { return "—"; }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link href="/estoque"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Pill className="h-5 w-5 text-primary" /> Medicamentos por {terms.paciente}</h1>
            <p className="text-sm text-muted-foreground">Controle automático de consumo diário e reposição</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchResumo}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Atualizar</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><Users className="h-4 w-4 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{totalAcolhidos}</p><p className="text-[10px] text-muted-foreground">Com medicação</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Activity className="h-4 w-4 mx-auto mb-1 text-blue-600" /><p className="text-2xl font-bold text-blue-600">{emUso}</p><p className="text-[10px] text-muted-foreground">Em uso ativo</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Pill className="h-4 w-4 mx-auto mb-1 text-emerald-600" /><p className="text-2xl font-bold">{totalMedicamentos}</p><p className="text-[10px] text-muted-foreground">Total medicamentos</p></CardContent></Card>
        <Card className={precisamRepor > 0 ? "border-amber-300" : ""}><CardContent className="p-4 text-center"><AlertTriangle className="h-4 w-4 mx-auto mb-1 text-amber-600" /><p className="text-2xl font-bold text-amber-600">{precisamRepor}</p><p className="text-[10px] text-muted-foreground">Precisam repor</p></CardContent></Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Buscar ${terms.paciente.toLowerCase()}...`} value={busca} onChange={e => setBusca(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          {[
            { id: "todos", label: `Todos (${resumo.length})` },
            { id: "repor", label: `Repor (${precisamRepor})` },
            { id: "ativos", label: "Em uso" },
          ].map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${filtro === f.id ? "bg-background shadow text-primary" : "text-muted-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <Pill className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {resumo.length === 0 ? "Nenhuma dispensação registrada. Dispense medicamentos na aba Estoque." : "Nenhum resultado para o filtro."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <Card key={r.pacienteId} className={r.precisaRepor ? "border-amber-300" : ""}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => loadHistorico(r.pacienteId)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {r.nome.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                    </div>
                    <Link href={`/pacientes/${r.pacienteId}`} className="hover:underline" onClick={e => e.stopPropagation()}>{r.nome}</Link>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{r.medicamentos.length} med.</Badge>
                    {r.precisaRepor && <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300">Repor</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {r.medicamentos.map((m: any, i: number) => {
                    const pct = m.totalDispensado > 0 ? Math.round((m.restante / m.totalDispensado) * 100) : 0;
                    const cfg = m.status === "ESGOTADO" ? { color: "text-red-600", bar: "bg-red-500", icon: PackageX, label: "Esgotado" }
                      : m.status === "REPOR" ? { color: "text-amber-600", bar: "bg-amber-500", icon: AlertTriangle, label: `${m.diasRestantes}d restantes` }
                      : m.status === "MANUAL" ? { color: "text-slate-500", bar: "bg-slate-400", icon: Pill, label: "Controle manual" }
                      : { color: "text-emerald-600", bar: "bg-emerald-500", icon: CheckCircle2, label: `${m.diasRestantes}d restantes` };
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-medium"><Pill className="h-3.5 w-3.5 text-primary" /> {m.nome}</span>
                          <span className="text-xs font-bold">{m.restante} <span className="text-muted-foreground font-normal">/ {m.totalDispensado} {m.unidade}</span></span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cfg.bar} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{m.posologia || "—"}{m.consumoDiario > 0 && ` · ${m.consumoDiario} ${m.unidade}/dia`}</span>
                          <span className={`flex items-center gap-1 font-medium ${cfg.color}`}><Icon className="h-3 w-3" /> {cfg.label}</span>
                        </div>
                        {m.dataFim && m.consumoDiario > 0 && (
                          <p className="text-[9px] text-muted-foreground flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> Previsão de término: {fmtDate(m.dataFim)}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Expandable history */}
                {expandido === r.pacienteId && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Histórico de dispensações</p>
                    {historico[r.pacienteId] ? (
                      historico[r.pacienteId].length > 0 ? (
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {historico[r.pacienteId].map((h: any) => (
                            <div key={h.id} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-muted/30">
                              <span>{fmtDate(h.data)} · <strong>{h.medicamento}</strong> {h.dosagem ? `(${h.dosagem})` : ""}</span>
                              <Badge variant="secondary" className="text-[9px]">{h.quantidade} {h.unidade}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-[10px] text-muted-foreground">Sem histórico.</p>
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}

                <button onClick={() => loadHistorico(r.pacienteId)} className="text-[10px] text-primary hover:underline mt-2">
                  {expandido === r.pacienteId ? "Ocultar histórico" : "Ver histórico de dispensações →"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
