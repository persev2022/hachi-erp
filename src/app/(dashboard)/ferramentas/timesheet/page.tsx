"use client";
import * as React from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";
import Link from "next/link";

export default function TimesheetPage() {
  useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [projeto, setProjeto] = React.useState("");
  const [tarefa, setTarefa] = React.useState("");
  const [horas, setHoras] = React.useState("");
  const [data, setData] = React.useState("");
  const [profissional, setProfissional] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projeto || !tarefa || !horas || !data) {
      setError("Preencha projeto, tarefa, horas e data");
      return;
    }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/services/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projeto, tarefa, horas: parseFloat(horas),
          data, profissional, observacoes,
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) {
        setError(d.error || "Erro ao salvar");
        return;
      }
      setSuccess(true);
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ferramentas" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">Timesheet</h1>
      </div>
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Registro salvo com sucesso!</div>}
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Projeto *</label><input value={projeto} onChange={e => setProjeto(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Tarefa *</label><input value={tarefa} onChange={e => setTarefa(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Horas *</label><input type="number" step="0.25" min="0.25" value={horas} onChange={e => setHoras(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Data *</label><input type="date" value={data} onChange={e => setData(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Profissional</label><input value={profissional} onChange={e => setProfissional(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Observações</label><textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={3} /></div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Registrar Horas
        </button>
      </form>
    </div>
  );
}
