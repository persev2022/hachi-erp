"use client";

import * as React from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Loader2,
  X,
  CheckCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

interface Comunicacao {
  id: string;
  paciente: { id: string; nome: string } | null;
  destinatario: string;
  canal: string;
  mensagem: string;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  ENVIADA: { icon: Check, color: "text-blue-500", label: "Enviada" },
  ENTREGUE: { icon: CheckCheck, color: "text-blue-500", label: "Entregue" },
  LIDA: { icon: CheckCheck, color: "text-emerald-500", label: "Lida" },
  FALHA: { icon: AlertCircle, color: "text-red-500", label: "Falha" },
};

function formatDateTime(d: string) {
  try {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function ComunicacaoPage() {
  const terms = useTerminology();
  const { show } = useToast();
  const [comunicacoes, setComunicacoes] = React.useState<Comunicacao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string; telefone?: string }[]>([]);

  const fetchComunicacoes = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integracoes/botconversa");
      const data = await res.json();
      if (data.success) setComunicacoes(data.data);
    } catch {
      show("Erro ao carregar histórico", "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  React.useEffect(() => { fetchComunicacoes(); }, [fetchComunicacoes]);

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPacientes(d.data.map((p: any) => ({
          id: p.id, nome: p.nome, telefone: p.responsaveis?.[0]?.telefone,
        })));
      })
      .catch(() => {});
  }, []);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      action: "enviar-mensagem",
      pacienteId: form.get("pacienteId") || undefined,
      destinatario: form.get("destinatario"),
      mensagem: form.get("mensagem"),
    };

    try {
      const res = await fetch("/api/integracoes/botconversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        show("Mensagem enviada!", "success");
        setShowForm(false);
        fetchComunicacoes();
      } else {
        show(data.error || "Erro ao enviar", "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setSending(false); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Comunicação</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envio de mensagens via WhatsApp (BotConversa)
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Send className="h-4 w-4 mr-2" />Nova Mensagem
        </Button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Enviar Mensagem WhatsApp</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSend} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{`${terms.paciente} (opcional)`}</label>
                <select
                  name="pacienteId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Nenhum (envio direto)</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone *</label>
                <Input name="destinatario" required placeholder="5548999990001" />
                <p className="text-xs text-muted-foreground">Formato: DDI + DDD + Número (ex: 5548999990001)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem *</label>
                <textarea
                  name="mensagem"
                  required
                  rows={4}
                  placeholder="Digite sua mensagem..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Send className="h-4 w-4 mr-2" />Enviar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Histórico */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comunicacoes.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Nenhuma mensagem enviada ainda.</p>
          <p className="text-xs mt-1">Configure a BOTCONVERSA_API_KEY no .env para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comunicacoes.map((com) => {
            const st = statusConfig[com.status] || statusConfig.ENVIADA;
            const StatusIcon = st.icon;
            return (
              <Card key={com.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{com.destinatario}</span>
                        {com.paciente && (
                          <Badge variant="outline" className="text-xs">
                            {com.paciente.nome}
                          </Badge>
                        )}
                        <StatusIcon className={`h-3.5 w-3.5 ${st.color}`} />
                        <span className={`text-xs ${st.color}`}>{st.label}</span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1">{com.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(com.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
