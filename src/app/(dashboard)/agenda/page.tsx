"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface Agendamento {
  id: string;
  paciente: { id: string; nome: string };
  profissional: { id: string; name: string; role: string };
  tipo: string;
  dataHora: string;
  duracao: number;
  status: string;
  observacoes: string | null;
  sala: string | null;
}

const statusStyles: Record<string, string> = {
  AGENDADO: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMADO: "bg-blue-100 text-blue-700 border-blue-200",
  EM_ATENDIMENTO: "bg-indigo-100 text-indigo-700 border-indigo-200",
  CONCLUIDO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELADO: "bg-red-100 text-red-700 border-red-200",
  FALTA: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabel: Record<string, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_ATENDIMENTO: "Em Atendimento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  FALTA: "Falta",
};

function formatHora(d: string) {
  try {
    return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export default function AgendaPage() {
  const { show } = useToast();
  const [data, setData] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const [profissionais, setProfissionais] = React.useState<{ id: string; name: string; role: string }[]>([]);

  const fetchAgendamentos = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agenda?data=${data}`);
      const result = await res.json();
      if (result.success) {
        setAgendamentos(result.data);
      }
    } catch {
      show("Erro ao carregar agenda", "error");
    } finally {
      setLoading(false);
    }
  }, [data, show]);

  React.useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  // Fetch patients + professionals for form
  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome })));
      })
      .catch(() => {});

    fetch("/api/users?role=MEDICO,PSICOLOGO,ENFERMEIRO,TERAPEUTA")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProfissionais(d.data);
      })
      .catch(() => {});
  }, []);

  const changeDay = (offset: number) => {
    const d = new Date(data);
    d.setDate(d.getDate() + offset);
    setData(d.toISOString().split("T")[0]);
  };

  const dataFormatada = new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const resumo = {
    total: agendamentos.length,
    concluidos: agendamentos.filter((a) => a.status === "CONCLUIDO").length,
    pendentes: agendamentos.filter((a) => ["AGENDADO", "CONFIRMADO"].includes(a.status)).length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/agenda/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        show(result.error || "Erro ao atualizar", "error");
        return;
      }
      show("Status atualizado", "success");
      fetchAgendamentos();
    } catch {
      show("Erro de conexão", "error");
    }
  };

  const handleNewAgendamento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const dataHora = `${form.get("data")}T${form.get("hora")}:00`;

    const payload = {
      pacienteId: form.get("pacienteId"),
      profissionalId: form.get("profissionalId"),
      tipo: form.get("tipo"),
      dataHora,
      duracao: parseInt(form.get("duracao") as string) || 50,
      sala: form.get("sala") || undefined,
      observacoes: form.get("observacoes") || undefined,
    };

    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        show(result.error || "Erro ao criar agendamento", "error");
        return;
      }

      show("Agendamento criado!", "success");
      setShowForm(false);
      fetchAgendamentos();
    } catch {
      show("Erro de conexão", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Agenda</h1>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeDay(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground capitalize">{dataFormatada}</p>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeDay(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-auto"
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Modal Novo Agendamento */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Novo Agendamento</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleNewAgendamento} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paciente *</label>
                <select
                  name="pacienteId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione o paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Profissional *</label>
                <select
                  name="profissionalId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione o profissional</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo *</label>
                <select
                  name="tipo"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione</option>
                  <option value="Consulta Psiquiátrica">Consulta Psiquiátrica</option>
                  <option value="Terapia Individual">Terapia Individual</option>
                  <option value="Terapia em Grupo">Terapia em Grupo</option>
                  <option value="Avaliação Psicológica">Avaliação Psicológica</option>
                  <option value="Avaliação Enfermagem">Avaliação Enfermagem</option>
                  <option value="Revisão de Medicação">Revisão de Medicação</option>
                  <option value="Atendimento Social">Atendimento Social</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data *</label>
                  <Input name="data" type="date" required defaultValue={data} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora *</label>
                  <Input name="hora" type="time" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duração (min)</label>
                  <Input name="duracao" type="number" defaultValue={50} min={10} max={480} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sala</label>
                  <Input name="sala" placeholder="Ex: Sala 1" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Input name="observacoes" placeholder="Notas adicionais..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Agendar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resumo do dia */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Total Hoje", value: resumo.total, icon: Calendar },
          { label: "Concluídos", value: resumo.concluidos, icon: Clock },
          { label: "Pendentes", value: resumo.pendentes, icon: User },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-lg p-3 md:p-4 flex items-center gap-3">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Timeline do dia */}
      {!loading && (
        <div className="bg-card border rounded-lg divide-y">
          {agendamentos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum agendamento para esta data.
            </div>
          ) : (
            agendamentos.map((ag) => (
              <div key={ag.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 hover:bg-muted/30 transition">
                <div className="text-center w-14 shrink-0 hidden sm:block">
                  <p className="text-lg font-bold text-foreground">
                    {formatHora(ag.dataHora).split(":")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    :{formatHora(ag.dataHora).split(":")[1]}
                  </p>
                </div>
                <div className="h-10 w-0.5 bg-border rounded-full shrink-0 hidden sm:block" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">
                      {formatHora(ag.dataHora)}
                    </span>
                    <p className="font-medium text-sm truncate">{ag.paciente.nome}</p>
                    <Badge variant="outline" className={statusStyles[ag.status]}>
                      {statusLabel[ag.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ag.tipo} — {ag.profissional.name}
                    {ag.sala && ` — ${ag.sala}`} — {ag.duracao}min
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {ag.status === "AGENDADO" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleStatusChange(ag.id, "CONFIRMADO")}
                    >
                      Confirmar
                    </Button>
                  )}
                  {ag.status === "CONFIRMADO" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleStatusChange(ag.id, "EM_ATENDIMENTO")}
                    >
                      Iniciar
                    </Button>
                  )}
                  {ag.status === "EM_ATENDIMENTO" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleStatusChange(ag.id, "CONCLUIDO")}
                    >
                      Concluir
                    </Button>
                  )}
                  {["AGENDADO", "CONFIRMADO"].includes(ag.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive"
                      onClick={() => handleStatusChange(ag.id, "CANCELADO")}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
