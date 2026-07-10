"use client";
import * as React from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";
import Link from "next/link";

interface Paciente { id: string; nome: string }

export default function MedicacaoPage() {
  const terms = useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = React.useState("");
  const [medicamento, setMedicamento] = React.useState("");
  const [dosagem, setDosagem] = React.useState("");
  const [horarios, setHorarios] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100").then(r => r.json()).then(d => {
      if (d.success) setPacientes(d.data || []);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteId || !medicamento || !dosagem) { setError("Preencha paciente, medicamento e dosagem"); return; }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/senior/medicacao", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, medicamento, dosagem, horarios: horarios.split(",").map(s => s.trim()).filter(Boolean), observacoes }),
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
        <h1 className="text-xl font-bold">Controle de Medicação</h1>
      </div>
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Medicação registrada com sucesso!</div>}
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">{terms.paciente}</label>
          <select value={pacienteId} onChange={e => setPacienteId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm">
            <option value="">Selecione...</option>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Medicamento *</label><input value={medicamento} onChange={e => setMedicamento(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Ex: Paracetamol" /></div>
        <div><label className="block text-sm font-medium mb-1">Dosagem *</label><input value={dosagem} onChange={e => setDosagem(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Ex: 500mg" /></div>
        <div><label className="block text-sm font-medium mb-1">Horários (separar por vírgula)</label><input value={horarios} onChange={e => setHorarios(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="08:00, 14:00, 20:00" /></div>
        <div><label className="block text-sm font-medium mb-1">Observações</label><textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={3} /></div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Salvar Medicação
        </button>
      </form>
    </div>
  );
}
