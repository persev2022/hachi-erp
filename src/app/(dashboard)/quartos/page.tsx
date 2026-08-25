"use client";

import * as React from "react";
import Link from "next/link";
import { BedDouble, User, Wrench, Sparkles, Loader2, Plus, ArrowRightLeft, X, Pencil, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

interface Quarto {
  id: string;
  numero: string;
  andar: number;
  tipo: string | null;
  status: string;
  capacidade: number;
  observacoes: string | null;
  pacientes: { id: string; nome: string }[];
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  DISPONIVEL: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", icon: BedDouble, label: "Disponível" },
  OCUPADO: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800", icon: User, label: "Ocupado" },
  MANUTENCAO: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", icon: Wrench, label: "Manutenção" },
  LIMPEZA: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800", icon: Sparkles, label: "Limpeza" },
};

export default function QuartosPage() {
  const terms = useTerminology();
  const [quartos, setQuartos] = React.useState<Quarto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const { show } = useToast();

  // Modals
  const [showCreate, setShowCreate] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState<Quarto | null>(null);
  const [showTransfer, setShowTransfer] = React.useState(false);
  const [showActions, setShowActions] = React.useState<string | null>(null);

  // Transfer state
  const [transferPaciente, setTransferPaciente] = React.useState("");
  const [transferQuarto, setTransferQuarto] = React.useState("");

  // Form state
  const [submitting, setSubmitting] = React.useState(false);

  const fetchQuartos = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quartos");
      const data = await res.json();
      if (data.success) setQuartos(data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchQuartos(); }, [fetchQuartos]);
  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100&status=ATIVO")
      .then(r => r.json())
      .then(d => { if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome }))); })
      .catch(() => {});
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/quartos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (data.success) { show("Status atualizado!", "success"); fetchQuartos(); }
      else show(data.error || "Erro", "error");
    } catch { show("Erro de conexão", "error"); }
    setShowActions(null);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      numero: form.get("numero") as string,
      andar: parseInt(form.get("andar") as string) || 1,
      capacidade: parseInt(form.get("capacidade") as string) || 1,
      tipo: (form.get("tipo") as string) || undefined,
      observacoes: (form.get("observacoes") as string) || undefined,
    };
    try {
      const res = await fetch("/api/quartos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (d.success) { show(`Quarto ${payload.numero} criado!`, "success"); setShowCreate(false); fetchQuartos(); }
      else show(d.error || "Erro", "error");
    } catch { show("Erro", "error"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showEdit) return;
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      numero: form.get("numero") as string,
      andar: parseInt(form.get("andar") as string) || 1,
      capacidade: parseInt(form.get("capacidade") as string) || 1,
      tipo: (form.get("tipo") as string) || null,
      observacoes: (form.get("observacoes") as string) || null,
    };
    try {
      const res = await fetch(`/api/quartos/${showEdit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (d.success) { show("Quarto atualizado!", "success"); setShowEdit(null); fetchQuartos(); }
      else show(d.error || "Erro", "error");
    } catch { show("Erro", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, numero: string) => {
    if (!confirm(`Excluir quarto ${numero}? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/quartos/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) { show(d.message, "success"); fetchQuartos(); }
      else show(d.error || "Erro", "error");
    } catch { show("Erro", "error"); }
  };

  const handleTransfer = async () => {
    if (!transferPaciente || !transferQuarto) { show("Selecione paciente e quarto", "warning"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/quartos/transferir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pacienteId: transferPaciente, quartoDestinoId: transferQuarto }) });
      const d = await res.json();
      if (d.success) { show(d.message || "Transferido!", "success"); setShowTransfer(false); fetchQuartos(); }
      else show(d.error || "Erro", "error");
    } catch { show("Erro", "error"); }
    finally { setSubmitting(false); }
  };

  const ocupados = quartos.filter(q => q.status === "OCUPADO").length;
  const disponiveis = quartos.filter(q => q.status === "DISPONIVEL").length;
  const totalVagas = quartos.reduce((s, q) => s + q.capacidade, 0);
  const totalOcupantes = quartos.reduce((s, q) => s + q.pacientes.length, 0);
  const andares = [...new Set(quartos.map(q => q.andar))].sort();

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{terms.quartos}</h1>
          <p className="text-sm text-muted-foreground">Gestão dinâmica de ocupação</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => window.open("/api/quartos/exportar", "_blank")}>Exportar</Button>
          <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Transferir
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo Quarto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{quartos.length}</p><p className="text-[9px] text-muted-foreground">Quartos</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{totalOcupantes}</p><p className="text-[9px] text-muted-foreground">Ocupantes</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{totalVagas - totalOcupantes}</p><p className="text-[9px] text-muted-foreground">Vagas Livres</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{totalVagas > 0 ? Math.round((totalOcupantes / totalVagas) * 100) : 0}%</p><p className="text-[9px] text-muted-foreground">Ocupação</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{disponiveis}</p><p className="text-[9px] text-muted-foreground">Disponíveis</p></CardContent></Card>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${cfg.bg} border`} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Room Map by Floor */}
      {andares.map(andar => (
        <div key={andar}>
          <h2 className="text-lg font-semibold mb-3">{andar === 0 ? "Área Externa" : `${andar}º Andar`}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quartos.filter(q => q.andar === andar).map(quarto => {
              const cfg = statusConfig[quarto.status] || statusConfig.DISPONIVEL;
              const Icon = cfg.icon;
              const vagas = quarto.capacidade - quarto.pacientes.length;

              return (
                <div key={quarto.id} className={`rounded-lg border p-3 ${cfg.bg} transition-all hover:shadow-md relative group`}>
                  {/* Edit/Delete buttons on hover */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                    <button onClick={() => setShowEdit(quarto)} className="p-1 rounded hover:bg-black/10">
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    {quarto.pacientes.length === 0 && (
                      <button onClick={() => handleDelete(quarto.id, quarto.numero)} className="p-1 rounded hover:bg-red-100">
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{quarto.numero}</span>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{quarto.tipo || "Padrão"} · {quarto.pacientes.length}/{quarto.capacidade}</p>

                  {/* Occupants */}
                  {quarto.pacientes.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {quarto.pacientes.map(p => (
                        <Link key={p.id} href={`/pacientes/${p.id}`} className="text-[10px] font-medium truncate block hover:underline">{p.nome}</Link>
                      ))}
                    </div>
                  )}

                  {/* Vacancies */}
                  {vagas > 0 && quarto.status !== "MANUTENCAO" && quarto.status !== "LIMPEZA" && (
                    <Badge variant="outline" className="mt-1.5 text-[8px] border-emerald-300 text-emerald-600">
                      {vagas} vaga{vagas > 1 ? "s" : ""}
                    </Badge>
                  )}

                  {/* Quick status actions */}
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {quarto.status === "DISPONIVEL" && (
                      <button onClick={() => handleStatusChange(quarto.id, "MANUTENCAO")} className="text-[8px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200">Manutenção</button>
                    )}
                    {quarto.status === "MANUTENCAO" && (
                      <button onClick={() => handleStatusChange(quarto.id, "DISPONIVEL")} className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Liberar</button>
                    )}
                    {quarto.status === "LIMPEZA" && (
                      <button onClick={() => handleStatusChange(quarto.id, "DISPONIVEL")} className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Pronto</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {quartos.length === 0 && (
        <div className="text-center py-12">
          <BedDouble className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground mb-3">Nenhum quarto cadastrado</p>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Criar Primeiro Quarto</Button>
        </div>
      )}

      {/* ═══ MODAL: Criar Quarto ═══ */}
      {showCreate && (
        <Modal title="Novo Quarto" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Número/Nome *</label>
                <Input name="numero" required placeholder="Ex: Q-01, Cabana 1" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Andar</label>
                <Input name="andar" type="number" defaultValue={1} min={0} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Capacidade *</label>
                <Input name="capacidade" type="number" defaultValue={2} min={1} max={20} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Tipo</label>
                <select name="tipo" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                  <option value="">Padrão</option>
                  <option value="Individual">Individual</option>
                  <option value="Duplo">Duplo</option>
                  <option value="Triplo">Triplo</option>
                  <option value="Enfermaria">Enfermaria</option>
                  <option value="Cabana">Cabana</option>
                  <option value="Suíte">Suíte</option>
                  <option value="Externo">Externo</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Observações</label>
              <Input name="observacoes" placeholder="Ex: Vista para o jardim, banheiro privativo..." />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Criar Quarto
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ MODAL: Editar Quarto ═══ */}
      {showEdit && (
        <Modal title={`Editar ${showEdit.numero}`} onClose={() => setShowEdit(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Número/Nome *</label>
                <Input name="numero" required defaultValue={showEdit.numero} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Andar</label>
                <Input name="andar" type="number" defaultValue={showEdit.andar} min={0} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Capacidade *</label>
                <Input name="capacidade" type="number" defaultValue={showEdit.capacidade} min={1} max={20} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Tipo</label>
                <select name="tipo" defaultValue={showEdit.tipo || ""} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                  <option value="">Padrão</option>
                  <option value="Individual">Individual</option>
                  <option value="Duplo">Duplo</option>
                  <option value="Triplo">Triplo</option>
                  <option value="Enfermaria">Enfermaria</option>
                  <option value="Cabana">Cabana</option>
                  <option value="Suíte">Suíte</option>
                  <option value="Externo">Externo</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Observações</label>
              <Input name="observacoes" defaultValue={showEdit.observacoes || ""} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEdit(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} <Save className="h-3.5 w-3.5 mr-1" /> Salvar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ MODAL: Transferir ═══ */}
      {showTransfer && (
        <Modal title={`Transferir ${terms.paciente}`} onClose={() => setShowTransfer(false)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{terms.paciente}</label>
              <select value={transferPaciente} onChange={e => setTransferPaciente(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quarto Destino</label>
              <select value={transferQuarto} onChange={e => setTransferQuarto(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione</option>
                {quartos.filter(q => q.pacientes.length < q.capacidade && q.status !== "MANUTENCAO" && q.status !== "LIMPEZA").map(q => (
                  <option key={q.id} value={q.id}>{q.numero} — {q.pacientes.length}/{q.capacidade} ({q.tipo || "Padrão"})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowTransfer(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleTransfer} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Transferir
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Reusable Modal component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
