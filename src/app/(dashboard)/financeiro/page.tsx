"use client";

import * as React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

interface Movimentacao {
  id: string;
  paciente: { id: string; nome: string } | null;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
  formaPagamento: string | null;
}

const statusStyles: Record<string, string> = {
  PAGO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDENTE: "bg-amber-100 text-amber-700 border-amber-200",
  ATRASADO: "bg-red-100 text-red-700 border-red-200",
  CANCELADO: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; }
}

export default function FinanceiroPage() {
  const terms = useTerminology();
  const { show } = useToast();
  const [movimentacoes, setMovimentacoes] = React.useState<Movimentacao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [resumo, setResumo] = React.useState({ totalReceitas: 0, totalDespesas: 0 });
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/financeiro?pageSize=50");
      const data = await res.json();
      if (data.success) {
        setMovimentacoes(data.data);
        setResumo(data.resumo);
      }
    } catch {
      show("Erro ao carregar dados financeiros", "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome }))); })
      .catch(() => {});
  }, []);

  const saldo = resumo.totalReceitas - resumo.totalDespesas;
  const inadimplentes = movimentacoes.filter((m) => m.status === "ATRASADO").length;

  const handlePagar = async (id: string) => {
    try {
      const res = await fetch(`/api/financeiro/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAGO", formaPagamento: "Pix" }),
      });
      const data = await res.json();
      if (data.success) { show("Pagamento registrado!", "success"); fetchData(); }
      else show(data.error || "Erro", "error");
    } catch { show("Erro de conexão", "error"); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      pacienteId: form.get("pacienteId") || undefined,
      tipo: form.get("tipo"),
      categoria: form.get("categoria"),
      descricao: form.get("descricao"),
      valor: parseFloat(form.get("valor") as string),
      dataVencimento: form.get("dataVencimento"),
      formaPagamento: form.get("formaPagamento") || undefined,
      observacoes: form.get("observacoes") || undefined,
    };

    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { show("Movimentação criada!", "success"); setShowForm(false); fetchData(); }
      else show(data.error || "Erro ao criar", "error");
    } catch { show("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle financeiro e faturamento</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />Nova Movimentação
        </Button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Nova Movimentação</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo *</label>
                  <select name="tipo" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria *</label>
                  <select name="categoria" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="MENSALIDADE">Mensalidade</option>
                    <option value="MATRICULA">Matrícula</option>
                    <option value="MEDICAMENTO">Medicamento</option>
                    <option value="ALIMENTACAO">Alimentação</option>
                    <option value="TRANSPORTE">Transporte</option>
                    <option value="LAVANDERIA">Lavanderia</option>
                    <option value="EXAME">Exame</option>
                    <option value="PROCEDIMENTO">Procedimento</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{terms.paciente}</label>
                <select name="pacienteId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">{`Sem ${terms.paciente.toLowerCase()} (despesa geral)`}</option>
                  {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição *</label>
                <Input name="descricao" required placeholder="Ex: Mensalidade Julho" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor (R$) *</label>
                  <Input name="valor" type="number" required min={0.01} step={0.01} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vencimento *</label>
                  <Input name="dataVencimento" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <select name="formaPagamento" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Não definida</option>
                  <option value="Pix">Pix</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Input name="observacoes" placeholder="Notas..." />
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card border rounded-lg p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Receitas</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                R$ {resumo.totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Despesas</p>
              <p className="text-lg md:text-2xl font-bold text-red-600">
                R$ {resumo.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Saldo</p>
              <p className={`text-lg md:text-2xl font-bold ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Inadimplentes</p>
              <p className="text-lg md:text-2xl font-bold text-amber-600">{inadimplentes}</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Movimentações Recentes</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>{terms.paciente}</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(mov.dataVencimento)}</TableCell>
                  <TableCell className="font-medium">{mov.paciente?.nome || "—"}</TableCell>
                  <TableCell>{mov.descricao}</TableCell>
                  <TableCell>
                    {mov.tipo === "RECEITA" ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-sm"><TrendingUp className="h-3 w-3" />Receita</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm"><TrendingDown className="h-3 w-3" />Despesa</span>
                    )}
                  </TableCell>
                  <TableCell className={`font-medium whitespace-nowrap ${mov.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"}`}>
                    {mov.tipo === "RECEITA" ? "+" : "-"} R$ {mov.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[mov.status] || ""}>
                      {mov.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {["PENDENTE", "ATRASADO"].includes(mov.status) && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handlePagar(mov.id)}>
                        Pagar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {movimentacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma movimentação encontrada.
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
