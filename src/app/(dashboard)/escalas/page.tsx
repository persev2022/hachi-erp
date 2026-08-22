"use client";

import * as React from "react";
import { Loader2, Plus, Trash2, Calendar, Users, Clock, Sun, Moon, Sunrise } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface EscalaEntry {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  profissionalRole: string;
  data: string;
  turno: "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";
  observacoes?: string;
}

const turnoConfig = {
  MANHA: { label: "Manhã", icon: Sunrise, color: "bg-amber-100 text-amber-700", time: "06h-14h" },
  TARDE: { label: "Tarde", icon: Sun, color: "bg-orange-100 text-orange-700", time: "14h-22h" },
  NOITE: { label: "Noite", icon: Moon, color: "bg-indigo-100 text-indigo-700", time: "22h-06h" },
  INTEGRAL: { label: "Integral", icon: Clock, color: "bg-emerald-100 text-emerald-700", time: "24h" },
};

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function EscalasPage() {
  const [escalas, setEscalas] = React.useState<EscalaEntry[]>([]);
  const [profissionais, setProfissionais] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [weekOffset, setWeekOffset] = React.useState(0);
  const { show } = useToast();

  const getMonday = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const monday = getMonday(weekOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const mondayStr = monday.toISOString().split("T")[0];
      const res = await fetch(`/api/escalas?semana=${mondayStr}`);
      const d = await res.json();
      if (d.success) {
        setEscalas(d.data);
        setProfissionais(d.profissionais || []);
      }
    } catch {} finally { setLoading(false); }
  }, [weekOffset]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      profissionalId: form.get("profissionalId"),
      data: form.get("data"),
      turno: form.get("turno"),
      observacoes: form.get("observacoes") || undefined,
    };

    try {
      const res = await fetch("/api/escalas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) { show("Escala adicionada!", "success"); setShowForm(false); fetchData(); }
      else show(d.error || "Erro", "error");
    } catch { show("Erro de conexão", "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/escalas?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) { show("Removida!", "success"); fetchData(); }
      else show(d.error || "Erro", "error");
    } catch { show("Erro", "error"); }
  };

  const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Escalas de Plantão
          </h1>
          <p className="text-sm text-muted-foreground">Organização de turnos da equipe</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>← Anterior</Button>
        <span className="text-sm font-medium">
          {formatDate(weekDays[0])} — {formatDate(weekDays[6])}
        </span>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>Próxima →</Button>
        {weekOffset !== 0 && <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>Hoje</Button>}
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium">Profissional</label>
                <select name="profissionalId" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                  <option value="">Selecione</option>
                  {profissionais.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Data</label>
                <input name="data" type="date" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Turno</label>
                <select name="turno" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                  <option value="MANHA">Manhã (06-14h)</option>
                  <option value="TARDE">Tarde (14-22h)</option>
                  <option value="NOITE">Noite (22-06h)</option>
                  <option value="INTEGRAL">Integral (24h)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Obs.</label>
                <input name="observacoes" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs" placeholder="Opcional" />
              </div>
              <Button type="submit" size="sm" className="h-9">Salvar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Week Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dayStr = day.toISOString().split("T")[0];
            const dayEscalas = escalas.filter(e => e.data === dayStr);
            const isToday = new Date().toISOString().split("T")[0] === dayStr;

            return (
              <div key={i} className={`border rounded-lg p-2 min-h-[120px] ${isToday ? "border-primary bg-primary/5" : ""}`}>
                <div className="text-center mb-2">
                  <p className="text-[10px] text-muted-foreground">{diasSemana[day.getDay()]}</p>
                  <p className={`text-sm font-bold ${isToday ? "text-primary" : ""}`}>{day.getDate()}</p>
                </div>
                <div className="space-y-1">
                  {dayEscalas.map(e => {
                    const turno = turnoConfig[e.turno];
                    return (
                      <div key={e.id} className={`p-1.5 rounded text-[9px] relative group ${turno.color}`}>
                        <p className="font-medium truncate">{e.profissionalNome.split(" ")[0]}</p>
                        <p className="opacity-70">{turno.label}</p>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                  {dayEscalas.length === 0 && (
                    <p className="text-[9px] text-muted-foreground text-center">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" /> Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(turnoConfig).map(([key, config]) => {
              const count = escalas.filter(e => e.turno === key).length;
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium">{config.label}</p>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
