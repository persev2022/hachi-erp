"use client";

import * as React from "react";
import { Package, AlertTriangle, Plus, Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast-simple";

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
  const [busca, setBusca] = React.useState("");
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [alertCount, setAlertCount] = React.useState(0);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { show } = useToast();

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("search", busca);
      const res = await fetch(`/api/estoque?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setAlertCount(data.meta.alertas);
      }
    } catch {
      show("Erro ao carregar estoque", "error");
    } finally {
      setLoading(false);
    }
  }, [busca, show]);

  React.useEffect(() => { fetchItems(); }, [fetchItems]);

  const alertas = items.filter((i) => i.quantidade <= i.minimo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      nome: form.get("nome"),
      categoria: form.get("categoria"),
      unidade: form.get("unidade"),
      quantidade: parseInt(form.get("quantidade") as string) || 0,
      minimo: parseInt(form.get("minimo") as string) || 5,
      validade: form.get("validade") || undefined,
      localizacao: form.get("localizacao") || undefined,
      fornecedor: form.get("fornecedor") || undefined,
    };

    try {
      const res = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { show("Item cadastrado!", "success"); setShowForm(false); fetchItems(); }
      else show(data.error || "Erro ao cadastrar", "error");
    } catch { show("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de medicamentos e materiais</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />Novo Item
        </Button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Novo Item</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input name="nome" required placeholder="Ex: Clonazepam 2mg" />
              </div>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unidade *</label>
                  <Input name="unidade" required placeholder="Ex: Cx, Un, L" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input name="quantidade" type="number" defaultValue={0} min={0} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mínimo (alerta)</label>
                  <Input name="minimo" type="number" defaultValue={5} min={0} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Validade</label>
                <Input name="validade" type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fornecedor</label>
                <Input name="fornecedor" placeholder="Nome do fornecedor" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Localização</label>
                <Input name="localizacao" placeholder="Ex: Armário A, Prateleira 2" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-800 text-sm">
              {alertas.length} item(ns) abaixo do estoque mínimo
            </span>
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

      {/* Busca */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const baixo = item.quantidade <= item.minimo;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{item.categoria}</TableCell>
                    <TableCell className={baixo ? "text-red-600 font-bold" : ""}>
                      {item.quantidade} {item.unidade}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.minimo} {item.unidade}</TableCell>
                    <TableCell className="text-muted-foreground">{formatValidade(item.validade)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.fornecedor || "—"}</TableCell>
                    <TableCell>
                      {baixo ? (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Baixo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum item no estoque.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
