"use client";

import * as React from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Loader2,
  Search,
  CheckCheck,
  Check,
  AlertCircle,
  User,
  Zap,
  FileText,
  Clock,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

interface Conversa {
  telefone: string;
  paciente: { id: string; nome: string } | null;
  ultimaMensagem: string;
  ultimaData: string;
  ultimoStatus: string;
  totalMensagens: number;
  direcao: "enviada" | "recebida";
}

interface Mensagem {
  id: string;
  mensagem: string;
  status: string;
  direcao: "enviada" | "recebida";
  createdAt: string;
  paciente: { id: string; nome: string } | null;
}

interface Template {
  id: string;
  nome: string;
  categoria: string;
  conteudo: string;
}

const statusIcon: Record<string, { icon: React.ElementType; color: string }> = {
  ENVIADA: { icon: Check, color: "text-gray-400" },
  ENTREGUE: { icon: CheckCheck, color: "text-gray-400" },
  LIDA: { icon: CheckCheck, color: "text-blue-500" },
  FALHA: { icon: AlertCircle, color: "text-red-500" },
};

const templates: Template[] = [
  { id: "lembrete-consulta", nome: "Lembrete Consulta", categoria: "lembrete", conteudo: "Olá! Lembrete: consulta agendada para amanhã. Nos vemos em breve! 🙏" },
  { id: "cobranca-mensalidade", nome: "Cobrança Mensalidade", categoria: "cobranca", conteudo: "Olá! A mensalidade encontra-se pendente. Favor regularizar. Dúvidas? Fale conosco." },
  { id: "boas-vindas", nome: "Boas-Vindas", categoria: "boas-vindas", conteudo: "Bem-vindo(a) à família Hachi! Estaremos disponíveis pelo WhatsApp para informações. 💚" },
  { id: "alta-programada", nome: "Aviso de Alta", categoria: "alta", conteudo: "Informamos que a alta está prevista em breve. Entre em contato para agendar a visita de orientação familiar." },
  { id: "visita", nome: "Dia de Visita", categoria: "geral", conteudo: "Lembrete: dia de visita é neste domingo das 14h às 17h. Esperamos vocês! 🤗" },
  { id: "evolucao", nome: "Atualização Clínica", categoria: "geral", conteudo: "Informamos que seu familiar está bem e progredindo no tratamento. Qualquer dúvida estamos à disposição. 💚" },
];

function formatTime(d: string) {
  try { return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
}
function formatDate(d: string) {
  try {
    const date = new Date(d);
    const today = new Date();
    const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Hoje";
    if (diff === 1) return "Ontem";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch { return ""; }
}
function formatPhone(phone: string) {
  if (phone.length === 13) return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
  if (phone.length === 12) return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 8)}-${phone.slice(8)}`;
  return phone;
}

export default function ComunicacaoPage() {
  const terms = useTerminology();
  const { show } = useToast();

  // State
  const [conversas, setConversas] = React.useState<Conversa[]>([]);
  const [mensagens, setMensagens] = React.useState<Mensagem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMsgs, setLoadingMsgs] = React.useState(false);
  const [selectedPhone, setSelectedPhone] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [messageText, setMessageText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showNewChat, setShowNewChat] = React.useState(false);
  const [newPhone, setNewPhone] = React.useState("");
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string; telefone?: string }[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversas = React.useCallback(async () => {
    try {
      const res = await fetch("/api/comunicacao/conversas");
      const data = await res.json();
      if (data.success) setConversas(data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchConversas(); }, [fetchConversas]);

  // Fetch pacientes for new chat
  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=200")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPacientes(d.data.map((p: any) => ({
          id: p.id, nome: p.nome,
          telefone: p.responsaveis?.[0]?.telefone || p.telefone,
        })));
      }).catch(() => {});
  }, []);

  // Fetch messages for selected contact
  React.useEffect(() => {
    if (!selectedPhone) return;
    setLoadingMsgs(true);
    fetch(`/api/comunicacao/mensagens?telefone=${selectedPhone}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setMensagens(d.data); })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [selectedPhone]);

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Send message
  const handleSend = async () => {
    if (!messageText.trim() || !selectedPhone) return;
    setSending(true);
    try {
      const res = await fetch("/api/integracoes/botconversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enviar-mensagem",
          destinatario: selectedPhone,
          mensagem: messageText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessageText("");
        // Add message to chat locally
        setMensagens((prev) => [...prev, {
          id: data.data.id,
          mensagem: messageText.trim(),
          status: "ENVIADA",
          direcao: "enviada",
          createdAt: new Date().toISOString(),
          paciente: null,
        }]);
        // Refresh conversas to update last message
        fetchConversas();
      } else {
        show(data.error || "Erro ao enviar", "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setSending(false); }
  };

  // Start new chat
  const handleNewChat = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) { show("Número inválido", "error"); return; }
    setSelectedPhone(clean);
    setShowNewChat(false);
    setNewPhone("");
    // If not in conversas, add it
    if (!conversas.find((c) => c.telefone === clean)) {
      setConversas((prev) => [{
        telefone: clean,
        paciente: null,
        ultimaMensagem: "",
        ultimaData: new Date().toISOString(),
        ultimoStatus: "",
        totalMensagens: 0,
        direcao: "enviada",
      }, ...prev]);
    }
  };

  // Filter conversas
  const filtered = conversas.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return c.telefone.includes(term) || c.paciente?.nome.toLowerCase().includes(term);
  });

  const selectedConversa = conversas.find((c) => c.telefone === selectedPhone);
  const contactName = selectedConversa?.paciente?.nome || formatPhone(selectedPhone || "");

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Sidebar - Contact List */}
      <div className={`w-full md:w-[360px] md:min-w-[360px] border-r flex flex-col bg-card ${selectedPhone ? "hidden md:flex" : "flex"}`}>
        {/* Sidebar Header */}
        <div className="p-3 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Conversas
            </h1>
            <Button size="sm" variant="ghost" onClick={() => setShowNewChat(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma conversa</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowNewChat(true)}>
                <Plus className="h-3 w-3 mr-1" /> Nova Conversa
              </Button>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.telefone}
                onClick={() => setSelectedPhone(c.telefone)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition flex items-center gap-3 ${
                  selectedPhone === c.telefone ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {c.paciente?.nome || formatPhone(c.telefone)}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDate(c.ultimaData)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {c.direcao === "enviada" && c.ultimoStatus && (() => {
                      const st = statusIcon[c.ultimoStatus];
                      if (!st) return null;
                      const Icon = st.icon;
                      return <Icon className={`h-3 w-3 ${st.color} shrink-0`} />;
                    })()}
                    <p className="text-xs text-muted-foreground truncate">{c.ultimaMensagem}</p>
                  </div>
                </div>
                {c.totalMensagens > 0 && (
                  <Badge variant="outline" className="text-[10px] shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                    {c.totalMensagens}
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedPhone ? "hidden md:flex" : "flex"}`}>
        {!selectedPhone ? (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Selecione uma conversa</p>
              <p className="text-xs text-muted-foreground mt-1">ou inicie uma nova conversa</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b bg-card flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSelectedPhone(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{contactName}</p>
                <p className="text-xs text-muted-foreground">{formatPhone(selectedPhone)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowTemplates(!showTemplates)}>
                  <Zap className="h-3.5 w-3.5 mr-1" /> Templates
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#e5ddd5] dark:bg-muted/10"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M20 10c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z' fill='%23000' fill-opacity='0.02'/%3E%3C/svg%3E\")" }}
            >
              {loadingMsgs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : mensagens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground bg-white/80 dark:bg-card/80 inline-block px-4 py-2 rounded-lg shadow-sm">
                    Nenhuma mensagem. Envie a primeira! 👋
                  </p>
                </div>
              ) : (
                mensagens.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Templates Drawer */}
            {showTemplates && (
              <div className="border-t bg-card px-4 py-3 max-h-[200px] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">TEMPLATES RÁPIDOS</p>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowTemplates(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setMessageText(t.conteudo); setShowTemplates(false); }}
                      className="text-left p-2 rounded-lg border hover:border-primary hover:bg-primary/5 transition text-xs"
                    >
                      <p className="font-medium truncate">{t.nome}</p>
                      <p className="text-muted-foreground truncate mt-0.5">{t.conteudo.slice(0, 40)}...</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t bg-card">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Digite uma mensagem..."
                    rows={1}
                    className="flex w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm resize-none min-h-[42px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ height: "auto", overflow: "hidden" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = Math.min(target.scrollHeight, 120) + "px";
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  className="h-[42px] w-[42px] rounded-full bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  onClick={handleSend}
                  disabled={!messageText.trim() || sending}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNewChat(false)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Nova Conversa</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowNewChat(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Digitar número</label>
                <div className="flex gap-2">
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="5548999990001"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleNewChat(newPhone)} disabled={newPhone.length < 10}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">DDI + DDD + Número</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Ou selecione um contato:</p>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {pacientes.filter((p) => p.telefone).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleNewChat(p.telefone!)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted flex items-center gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.nome}</p>
                        <p className="text-xs text-muted-foreground">{p.telefone}</p>
                      </div>
                    </button>
                  ))}
                  {pacientes.filter((p) => p.telefone).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum contato com telefone cadastrado
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ msg }: { msg: Mensagem }) {
  const isOut = msg.direcao === "enviada";
  const st = statusIcon[msg.status];
  const StatusIcon = st?.icon || Check;

  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-xl px-3 py-2 shadow-sm ${
          isOut
            ? "bg-[#d9fdd3] dark:bg-emerald-900/40 text-foreground rounded-tr-sm"
            : "bg-white dark:bg-card text-foreground rounded-tl-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{msg.mensagem}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOut ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
          {isOut && <StatusIcon className={`h-3 w-3 ${st?.color || "text-gray-400"}`} />}
        </div>
      </div>
    </div>
  );
}
