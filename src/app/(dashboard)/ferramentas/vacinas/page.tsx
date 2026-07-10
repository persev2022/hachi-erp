"use client";
import * as React from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";
import Link from "next/link";

interface Paciente { id: string; nome: string }

export default function VacinasPage() {
  const terms = useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = React.useState("");
  const [vacina, setVacina] = React.useState("");
  const [lote, setLote] = React.useState("");
  const [dataAplicacao, setDataAplicacao] = React.useState("");
  const [proximaDose, setProximaDose] = React.useState("");
  const [veterinario, setVeterinario] = React.useState("");

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100").then(r => r.json()).then(d => {
      if (d.success) setPacientes(d.data || []);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteId || !vacina || !dataAplicacao) { setError("Preencha paciente, vacina e data de aplicação"); return; }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/vet/vacinas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, vacina, lote, dataAplicacao, proximaDose: proximaDose || undefined, veterinario }),
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
        <Link href="/ferramentas" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">Registro de Vacinas</h1>
      </div>
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Vacina registrada com sucesso!</div>}
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">{terms.paciente} (Animal)</label>
          <select value={pacienteId} onChange={e => setPacienteId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm">
            <option value="">Selecione...</option>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Vacina *</label><input value={vacina} onChange={e => setVacina(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Ex: V10" /></div>
        <div><label className="block text-sm font-medium mb-1">Lote</label><input value={lote} onChange={e => setLote(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Data Aplicação *</label><input type="date" value={dataAplicacao} onChange={e => setDataAplicacao(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Próxima Dose</label><input type="date" value={proximaDose} onChange={e => setProximaDose(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Veterinário</label><input value={veterinario} onChange={e => setVeterinario(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Salvar Vacina
        </button>
      </form>
    </div>
  );
}
