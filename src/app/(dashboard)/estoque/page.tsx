"use client";

import * as React from "react";
import Link from "next/link";
import { Package, AlertTriangle, Plus, Search, Loader2, X, Pill, Users, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";
import { EmptyState } from "@/components/empty-state";
import { useTerminology } from "@/hooks/use-terminology";

interface Item {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  minimo: number;
  unidade: string;
  validade: string | null;
  fornecedor: string | null;
  localizacao: string | null;
}

function formatValidade(d: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }); } catch { return "—"; }
}

export default function EstoquePage() {
  const terms = useTerminology();
  const [busca, setBusca] = React.useState("");
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [tab] = React.useState<"estoque">("estoque");
  const { show } = useToast();

  // Dispensa
  const [dispensarItem, setDispensarItem] = React.useState<Item | null>(null);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("search", busca);
      const res = await fetch(`/api/estoque?${params.toString()}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch { show("Erro ao carregar estoque", "error"); }
    finally { setLoading(false); }
  }, [busca, show]);

  React.useEffect(() => { fetchItems(); }, [fetchItems]);

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100&status=ATIVO")
      .then(r => r.json())
      .then(d => { if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome }))); })
      .catch(() => {});
  }, []);

  const alertas = items.filter((i) => i.quantidade <= i.minimo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      nome: form.get("nome"), categoria: form.get("categoria"), unidade: form.get("unidade"),
      quantidade: parseInt(form.get("quantidade") as string) || 0,
      minimo: parseInt(form.get("minimo") as string) || 5,
      validade: form.get("validade") || undefined,
      localizacao: form.get("localizacao") || undefined,
      fornecedor: form.get("fornecedor") || undefined,
    };
    try {
      const res = await fetch("/api/estoque", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { show("Item cadastrado!", "success"); setShowForm(false); fetchItems(); }
      else show(data.error || "Erro ao cadastrar", "error");
    } catch { show("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDispensar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dispensarItem) return;
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      itemId: dispensarItem.id,
      pacienteId: (form.get("pacienteId") as string) || undefined,
      quantidade: parseInt(form.get("quantidade") as string) || 1,
      dosagem: (form.get("dosagem") as string) || undefined,
      observacoes: (form.get("observacoes") as string) || undefined,
    };
    try {
      const res = await fetch("/api/estoque/dispensar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { show(data.message || "Dispensado!", "success"); setDispensarItem(null); fetchItems(); }
      else show(data.error || "Erro ao dispensar", "error");
    } catch { show("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de medicamentos e materiais · dispensação por {terms.paciente.toLowerCase()}</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Novo Item</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <button onClick={() => setTab("estoque")} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium ${tab === "estoque" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}>
          <Package className="h-3.5 w-3.5" /> Estoque
        </button>
        <Link href="/estoque/medicamentos" className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground">
          <Users className="h-3.5 w-3.5" /> Medicamentos por {terms.paciente} →
        </Link>
      </div>

      {/* Alertas */}
      {tab === "estoque" && alertas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-800 text-sm dark:text-amber-300">{alertas.length} item(ns) abaixo do estoque mínimo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertas.map((item) => (
              <Badge key={item.id} variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                {item.nome} ({item.quantidade}/{item.minimo} {item.unidade})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ ESTOQUE TAB ═══════ */}
      {tab === "estoque" && (
        <>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="rounded-lg border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const baixo = item.quantidade <= item.minimo;
                    const isMed = item.categoria === "MEDICAMENTO";
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {isMed && <Pill className="h-3.5 w-3.5 text-primary" />}{item.nome}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.categoria}</TableCell>
                        <TableCell className={baixo ? "text-red-600 font-bold" : ""}>{item.quantidade} {item.unidade}</TableCell>
                        <TableCell className="text-muted-foreground">{formatValidade(item.validade)}</TableCell>
                        <TableCell>
                          {baixo ? <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Baixo</Badge>
                                 : <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">OK</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="text-xs" disabled={item.quantidade === 0} onClick={() => setDispensarItem(item)}>
                            <ArrowDownCircle className="h-3 w-3 mr-1" /> Dispensar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {items.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="p-0"><EmptyState module="estoque" /></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* ═══════ MODAL: Novo Item ═══════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Novo Item</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Nome *</label><Input name="nome" required placeholder="Ex: Clonazepam 2mg" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria *</label>
                  <select name="categoria" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="MEDICAMENTO">Medicamento</option>
                    <option value="MATERIAL_HOSPITALAR">Material Hospitalar</option>
                    <option value="HIGIENE">Higiene</option>
                    <option value="LIMPEZA">Limpeza</option>
                    <option value="ALIMENTO">Alimento</option>
                    <option value="EQUIPAMENTO">Equipamento</option>
                    <option value="ROUPA_CAMA">Roupa de Cama</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">Unidade *</label><Input name="unidade" required placeholder="Ex: Comp, Cx, mL" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><label className="text-sm font-medium">Quantidade</label><Input name="quantidade" type="number" defaultValue={0} min={0} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Mínimo (alerta)</label><Input name="minimo" type="number" defaultValue={5} min={0} /></div>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">Validade</label><Input name="validade" type="date" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Fornecedor</label><Input name="fornecedor" placeholder="Nome do fornecedor" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Localização</label><Input name="localizacao" placeholder="Ex: Armário A" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ MODAL: Dispensar ═══════ */}
      {dispensarItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDispensarItem(null)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2"><ArrowDownCircle className="h-4 w-4 text-primary" /> Dispensar</h2>
                <p className="text-xs text-muted-foreground">{dispensarItem.nome} · disponível: {dispensarItem.quantidade} {dispensarItem.unidade}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDispensarItem(null)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleDispensar} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{terms.paciente}</label>
                <select name="pacienteId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Estoque geral (sem {terms.paciente.toLowerCase()})</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade dispensada *</label>
                <Input name="quantidade" type="number" required min={1} max={dispensarItem.quantidade} defaultValue={1} />
                <p className="text-[10px] text-muted-foreground">Total entregue ao {terms.paciente.toLowerCase()} (ex: cartela com 30 comprimidos)</p>
              </div>

              {/* Posologia estruturada para controle automático */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-3">
                <p className="text-xs font-medium flex items-center gap-1"><Pill className="h-3 w-3" /> Posologia (controle diário automático)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Dose por vez</label>
                    <Input name="dosePorVez" type="number" step="0.5" min={0} placeholder="Ex: 1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Vezes por dia</label>
                    <select name="vezesPorDia" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">—</option>
                      <option value="1">1x/dia (24/24h)</option>
                      <option value="2">2x/dia (12/12h)</option>
                      <option value="3">3x/dia (8/8h)</option>
                      <option value="4">4x/dia (6/6h)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Início do uso</label>
                  <Input name="dataInicio" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
                <p className="text-[10px] text-muted-foreground">💡 Com a posologia, o sistema calcula automaticamente quanto o {terms.paciente.toLowerCase()} já consumiu e quantos dias ainda dura — sem baixa manual diária.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações / Dosagem (texto)</label>
                <Input name="dosagem" placeholder="Ex: tomar em jejum" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDispensarItem(null)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Confirmar Baixa</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
