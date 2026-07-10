"use client";
import * as React from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";
import Link from "next/link";

export default function TarifasPage() {
  useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [tipoQuarto, setTipoQuarto] = React.useState("");
  const [temporada, setTemporada] = React.useState("BAIXA");
  const [valorDiaria, setValorDiaria] = React.useState("");
  const [cafeDaManha, setCafeDaManha] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipoQuarto || !valorDiaria) {
      setError("Preencha tipo do quarto e valor da diária");
      return;
    }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/hotel/tarifas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoQuarto, temporada,
          valorDiaria: parseFloat(valorDiaria), cafeDaManha,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erro ao salvar");
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
        <h1 className="text-xl font-bold">Tarifas de Quartos</h1>
      </div>
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Tarifa salva com sucesso!</div>}
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div><label className="block text-sm font-medium mb-1">Tipo de Quarto *</label><input value={tipoQuarto} onChange={e => setTipoQuarto(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Ex: Standard, Luxo, Suíte" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Temporada</label>
            <select value={temporada} onChange={e => setTemporada(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm">
              <option value="BAIXA">Baixa</option><option value="MEDIA">Média</option><option value="ALTA">Alta</option><option value="FERIADO">Feriado</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Valor Diária (R$) *</label><input type="number" step="0.01" min="0" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cafeDaManha} onChange={e => setCafeDaManha(e.target.checked)} className="rounded" /> Inclui café da manhã</label>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Salvar Tarifa
        </button>
      </form>
    </div>
  );
}
