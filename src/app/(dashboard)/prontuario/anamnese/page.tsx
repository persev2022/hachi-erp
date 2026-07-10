"use client";
import * as React from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";
import Link from "next/link";

interface Paciente { id: string; nome: string }

export default function AnamnesePage() {
  const terms = useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = React.useState("");
  const [queixaPrincipal, setQueixaPrincipal] = React.useState("");
  const [historiaDoencaAtual, setHistoriaDoencaAtual] = React.useState("");
  const [historiaPregressa, setHistoriaPregressa] = React.useState("");
  const [historicoFamiliar, setHistoricoFamiliar] = React.useState("");
  const [medicamentos, setMedicamentos] = React.useState("");
  const [alergias, setAlergias] = React.useState("");
  const [tabagismo, setTabagismo] = React.useState(false);
  const [etilismo, setEtilismo] = React.useState(false);
  const [atividadeFisica, setAtividadeFisica] = React.useState("");
  const [alimentacao, setAlimentacao] = React.useState("");

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100").then(r => r.json()).then(d => {
      if (d.success) setPacientes(d.data || []);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteId || !queixaPrincipal) { setError("Selecione um paciente e preencha a queixa principal"); return; }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/clinic/anamnese", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, anamnese: { queixaPrincipal, historiaDoencaAtual, historiaPregressa, historicoFamiliar, medicamentosEmUso: medicamentos.split(",").map(s => s.trim()).filter(Boolean), alergias: alergias.split(",").map(s => s.trim()).filter(Boolean), habitos: { tabagismo, etilismo, atividadeFisica, alimentacao } } }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || "Erro ao salvar"); return; }
      setSuccess(true);
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/prontuario" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">Anamnese</h1>
      </div>
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Anamnese registrada com sucesso!</div>}
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">{terms.paciente}</label>
          <select value={pacienteId} onChange={e => setPacienteId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm">
            <option value="">Selecione...</option>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Queixa Principal *</label><textarea value={queixaPrincipal} onChange={e => setQueixaPrincipal(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={2} /></div>
        <div><label className="block text-sm font-medium mb-1">História da Doença Atual</label><textarea value={historiaDoencaAtual} onChange={e => setHistoriaDoencaAtual(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={2} /></div>
        <div><label className="block text-sm font-medium mb-1">História Pregressa</label><textarea value={historiaPregressa} onChange={e => setHistoriaPregressa(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={2} /></div>
        <div><label className="block text-sm font-medium mb-1">Histórico Familiar</label><textarea value={historicoFamiliar} onChange={e => setHistoricoFamiliar(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={2} /></div>
        <div><label className="block text-sm font-medium mb-1">Medicamentos em Uso (separar por vírgula)</label><input value={medicamentos} onChange={e => setMedicamentos(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Alergias (separar por vírgula)</label><input value={alergias} onChange={e => setAlergias(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={tabagismo} onChange={e => setTabagismo(e.target.checked)} className="rounded" /> Tabagismo</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={etilismo} onChange={e => setEtilismo(e.target.checked)} className="rounded" /> Etilismo</label>
        </div>
        <div><label className="block text-sm font-medium mb-1">Atividade Física</label><input value={atividadeFisica} onChange={e => setAtividadeFisica(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Alimentação</label><input value={alimentacao} onChange={e => setAlimentacao(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Salvar Anamnese
        </button>
      </form>
    </div>
  );
}
