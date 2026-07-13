"use client";

import * as React from "react";
import { Video, Plus, Copy, ExternalLink, Loader2, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-simple";

interface TeleconsultaSession {
  id: string;
  roomId: string;
  meetingLink: string;
  profissionalNome: string;
  dataHora: string;
  duracao: number;
  status: string;
  notas: string;
  pacienteId: string;
  createdAt: string;
}

export default function TeleconsultaPage() {
  const { show } = useToast();
  const [sessions, setSessions] = React.useState<TeleconsultaSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const [selectedPaciente, setSelectedPaciente] = React.useState("");

  React.useEffect(() => {
    fetch("/api/clinic/teleconsulta")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSessions(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/pacientes?pageSize=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome }))); })
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!selectedPaciente) { show("Selecione um paciente", "error"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/clinic/teleconsulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId: selectedPaciente, duracao: 30 }),
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => [{ ...data.data, createdAt: new Date().toISOString(), profissionalNome: "Você", dataHora: new Date().toISOString(), duracao: 30, status: "agendada", notas: "", pacienteId: selectedPaciente }, ...prev]);
        show("Teleconsulta criada! Link copiado.", "success");
        navigator.clipboard.writeText(data.data.meetingLink).catch(() => {});
      } else {
        show(data.error, "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setCreating(false); }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    show("Link copiado!", "success");
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-teal-600" />
          <h1 className="text-xl font-bold">Teleconsulta</h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Crie salas de videochamada e envie o link ao paciente. A sessão fica registrada no prontuário.
      </p>

      {/* Create new session */}
      <div className="bg-white dark:bg-zinc-900 border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-sm">Nova Teleconsulta</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedPaciente}
            onChange={(e) => setSelectedPaciente(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
          >
            <option value="">Selecione o paciente...</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <Button onClick={handleCreate} disabled={creating || !selectedPaciente}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Criar Sala
          </Button>
        </div>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Video className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma teleconsulta realizada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Video className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.profissionalNome || "Profissional"}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(s.dataHora || s.createdAt).toLocaleString("pt-BR")}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{s.duracao || 30}min</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.status === "agendada" ? "bg-blue-100 text-blue-700" : s.status === "finalizada" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {s.status || "agendada"}
                </span>
                {s.meetingLink && (
                  <>
                    <button onClick={() => copyLink(s.meetingLink)} className="p-1.5 rounded hover:bg-muted transition" title="Copiar link">
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <a href={s.meetingLink} target="_blank" rel="noopener" className="p-1.5 rounded hover:bg-muted transition" title="Abrir sala">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
