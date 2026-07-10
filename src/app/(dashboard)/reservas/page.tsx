"use client";

import * as React from "react";
import { Loader2, Plus, CalendarCheck, X, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";

interface Reserva {
  id: string;
  hospedeNome?: string;
  nome?: string;
  quartoId?: string;
  quarto?: string;
  checkin: string;
  checkout: string;
  status: string;
}

export default function ReservasPage() {
  useTerminology();
  const [reservas, setReservas] = React.useState<Reserva[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formSuccess, setFormSuccess] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [hospedeNome, setHospedeNome] = React.useState("");
  const [hospedeTelefone, setHospedeTelefone] = React.useState("");
  const [quartoId, setQuartoId] = React.useState("");
  const [checkin, setCheckin] = React.useState("");
  const [checkout, setCheckout] = React.useState("");
  const [adultos, setAdultos] = React.useState("1");
  const [criancas, setCriancas] = React.useState("0");
  const [observacoes, setObservacoes] = React.useState("");

  React.useEffect(() => {
    fetch("/api/hotel/reservas")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setReservas(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatDate(d: string) {
    try { return new Date(d).toLocaleDateString("pt-BR"); }
    catch { return d; }
  }

  function statusColor(status: string) {
    switch (status.toLowerCase()) {
      case "confirmada": case "reservado": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pendente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelada": case "cancelado": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "checkout": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hospedeNome || !checkin || !checkout) { setFormError("Preencha nome do hóspede, check-in e check-out"); return; }
    setFormLoading(true); setFormError(""); setFormSuccess(false);
    try {
      const res = await fetch("/api/hotel/reservas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospedeNome, hospedeTelefone, quartoId: quartoId || undefined, checkin, checkout, adultos: parseInt(adultos), criancas: parseInt(criancas), observacoes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setFormError(data.error || "Erro ao salvar"); return; }
      setFormSuccess(true);
      setReservas(prev => [{ id: Date.now().toString(), hospedeNome, quartoId, checkin, checkout, status: "RESERVADO" }, ...prev]);
    } catch { setFormError("Erro de conexão"); }
    finally { setFormLoading(false); }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Reservas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie reservas e check-ins</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nova Reserva"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          {formSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Reserva criada com sucesso!</div>}
          {formError && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Hóspede *</label><input value={hospedeNome} onChange={e => setHospedeNome(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Telefone</label><input value={hospedeTelefone} onChange={e => setHospedeTelefone(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">ID do Quarto</label><input value={quartoId} onChange={e => setQuartoId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="UUID do quarto (opcional)" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Check-in *</label><input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Check-out *</label><input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Adultos</label><input type="number" min="1" value={adultos} onChange={e => setAdultos(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Crianças</label><input type="number" min="0" value={criancas} onChange={e => setCriancas(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Observações</label><textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={2} /></div>
            <button type="submit" disabled={formLoading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />} Criar Reserva
            </button>
          </form>
        </div>
      )}

      {reservas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
          <p className="text-xs text-muted-foreground mt-1">Crie uma nova reserva para começar</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Hóspede</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quarto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check-in</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check-out</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.hospedeNome || r.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.quartoId || r.quarto || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.checkin)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.checkout)}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
