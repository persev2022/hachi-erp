"use client";
import * as React from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";
import Link from "next/link";

export default function PropostasPage() {
  useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [clienteNome, setClienteNome] = React.useState("");
  const [clienteEmail, setClienteEmail] = React.useState("");
  const [titulo, setTitulo] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [valor, setValor] = React.useState("");
  const [validade, setValidade] = React.useState("");
  const [status, setStatus] = React.useState("RASCUNHO");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteNome || !titulo || !valor) {
      setError("Preencha cliente, título e valor");
      return;
    }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/services/propostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNome, clienteEmail, titulo, descricao,
          valor: parseFloat(valor), validade, status,
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
        <h1 className="text-xl font-bold">Nova Proposta</h1>
      </div>
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Proposta criada com sucesso!</div>}
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Cliente *</label><input value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Título *</label><input value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Descrição</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" rows={3} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Valor (R$) *</label><input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Validade</label><input type="date" value={validade} onChange={e => setValidade(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background text-sm">
              <option value="RASCUNHO">Rascunho</option><option value="ENVIADA">Enviada</option><option value="APROVADA">Aprovada</option><option value="REJEITADA">Rejeitada</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Salvar Proposta
        </button>
      </form>
    </div>
  );
}
