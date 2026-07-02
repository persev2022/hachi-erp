"use client";

import * as React from "react";
import {
  FileHeart,
  Search,
  Clock,
  User,
  Stethoscope,
  Brain,
  Heart,
  Plus,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface Evolucao {
  id: string;
  pacienteId: string;
  paciente: { id: string; nome: string };
  profissional: { id: string; name: string; role: string };
  tipo: string;
  conteudo: string;
  sinaisVitais: any;
  assinado: boolean;
  assinadoEm: string | null;
  createdAt: string;
}

const tipoConfig: Record<string, { color: string; icon: React.ElementType }> = {
  MEDICA: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Stethoscope },
  PSICOLOGICA: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Brain },
  ENFERMAGEM: { color: "bg-pink-100 text-pink-700 border-pink-200", icon: Heart },
  TERAPEUTICA: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: User },
  SOCIAL: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: User },
  NUTRICIONAL: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: User },
};

function formatDateTime(d: string) {
  try {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function ProntuarioPage() {
  const [busca, setBusca] = React.useState("");
  const [filtroTipo, setFiltroTipo] = React.useState<string>("Todas");
  const [evolucoes, setEvolucoes] = React.useState<Evolucao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const { show } = useToast();

  const fetchEvolucoes = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroTipo !== "Todas") params.set("tipo", filtroTipo);
      params.set("pageSize", "50");

      const res = await fetch(`/api/prontuario/evolucoes?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setEvolucoes(data.data);
      }
    } catch {
      show("Erro ao carregar evoluções", "error");
    } finally {
      setLoading(false);
    }
  }, [filtroTipo, show]);

  React.useEffect(() => {
    fetchEvolucoes();
  }, [fetchEvolucoes]);

  // Fetch patients list for the form
  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100&status=ATIVO")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome })));
      })
      .catch(() => {});
  }, []);

  const filtradas = evolucoes.filter((e) => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      e.paciente.nome.toLowerCase().includes(term) ||
      e.profissional.name.toLowerCase().includes(term) ||
      e.conteudo.toLowerCase().includes(term)
    );
  });

  const handleNewEvolucao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      pacienteId: form.get("pacienteId"),
      tipo: form.get("tipo"),
      conteudo: form.get("conteudo"),
    };

    try {
      const res = await fetch("/api/prontuario/evolucoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        show(data.error || "Erro ao criar evolução", "error");
        return;
      }

      show("Evolução registrada com sucesso!", "success");
      setShowForm(false);
      fetchEvolucoes();
    } catch {
      show("Erro de conexão", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Prontuário Eletrônico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Evoluções clínicas e histórico dos pacientes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Evolução
        </Button>
      </div>

      {/* Modal de Nova Evolução */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Nova Evolução</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleNewEvolucao} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paciente *</label>
                <select
                  name="pacienteId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione o paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
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
                  <option value="MEDICA">Médica</option>
                  <option value="PSICOLOGICA">Psicológica</option>
                  <option value="ENFERMAGEM">Enfermagem</option>
                  <option value="TERAPEUTICA">Terapêutica</option>
                  <option value="SOCIAL">Social</option>
                  <option value="NUTRICIONAL">Nutricional</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Conteúdo da Evolução *</label>
                <textarea
                  name="conteudo"
                  required
                  minLength={10}
                  rows={6}
                  placeholder="Descreva a evolução clínica do paciente..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[120px]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente, profissional ou conteúdo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {["Todas", "MEDICA", "PSICOLOGICA", "ENFERMAGEM", "TERAPEUTICA"].map((tipo) => (
            <Button
              key={tipo}
              variant={filtroTipo === tipo ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => setFiltroTipo(tipo)}
            >
              {tipo === "Todas" ? "Todas" : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando evoluções...</span>
        </div>
      )}

      {/* Timeline de evoluções */}
      {!loading && (
        <div className="space-y-3">
          {filtradas.map((ev) => {
            const config = tipoConfig[ev.tipo] || tipoConfig.MEDICA;
            const Icon = config.icon;
            return (
              <div key={ev.id} className="bg-card border rounded-lg p-4 md:p-5 hover:shadow-sm transition">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`h-9 w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{ev.paciente.nome}</span>
                      <Badge variant="outline" className={config.color}>
                        {ev.tipo.charAt(0) + ev.tipo.slice(1).toLowerCase()}
                      </Badge>
                      {ev.assinado ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                          Não assinado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed line-clamp-2">
                      {ev.conteudo}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ev.profissional.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(ev.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtradas.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma evolução encontrada.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
