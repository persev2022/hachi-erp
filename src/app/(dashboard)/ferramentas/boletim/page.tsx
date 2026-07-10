"use client";
import * as React from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";
import Link from "next/link";

interface Paciente { id: string; nome: string }

export default function BoletimPage() {
  const terms = useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = React.useState("");
  const [disciplina, setDisciplina] = React.useState("");
  const [bimestre, setBimestre] = React.useState("1");
  const [nota, setNota] = React.useState("");
  const [faltas, setFaltas] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100").then(r => r.json()).then(d => {
      if (d.success) setPacientes(d.data || []);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteId || !disciplina) { setError("Preencha aluno e disciplina"); return; }
    const n = parseFloat(nota);
    if (isNaN(n) || n < 0 || n > 10) { setError("Nota deve ser entre 0 e 10"); return; }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/education/boletim", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, disciplina, bimestre: parseInt(bimestre), nota: n, faltas: parseInt(faltas) || 0, observacoes }),
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
        <h1 className="text-xl font-bold">Boletim Escolar</h1>
      </div>
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Nota registrada com sucesso!</div>}
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Aluno</label>
          <select value={pacienteId} onChange={e => setPacienteId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm">
            <option value="">Selecione...</option>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Disciplina *</label><input value={disciplina} onChange={e => setDisciplina(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Ex: Matemática" /></div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bimestre</label>
            <select value={bimestre} onChange={e => setBimestre(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm">
              <option value="1">1º</option><option value="2">2º</option><option value="3">3º</option><option value="4">4º</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Nota (0-10)</label><input type="number" min="0" max="10" step="0.1" value={nota} onChange={e => setNota(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Faltas</label><input type="number" min="0" value={faltas} onChange={e => setFaltas(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Observações</label><textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={3} /></div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Salvar Nota
        </button>
      </form>
    </div>
  );
}
