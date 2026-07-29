"use client";

import * as React from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Loader2,
  Search,
  User,
  ExternalLink,
  RefreshCw,
  Zap,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface Subscriber {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  ddd: string;
  created_at: string;
  live_chat: string;
  tags: { id: number; name: string }[];
}

function formatPhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 13) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  if (clean.length === 12) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
  return phone;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return ""; }
}

export default function ComunicacaoPage() {
  const { show } = useToast();
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedContact, setSelectedContact] = React.useState<Subscriber | null>(null);
  const [showSendModal, setShowSendModal] = React.useState(false);
  const [sendPhone, setSendPhone] = React.useState("");
  const [sendMessage, setSendMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"livechat" | "contatos">("livechat");

  // Fetch subscribers from BotConversa
  const fetchSubscribers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comunicacao/contatos?action=subscribers&page=${page}`);
      const data = await res.json();
      if (data.success && data.data?.results) {
        setSubscribers(data.data.results);
        setTotalCount(data.data.count || 0);
      }
    } catch {
      show("Erro ao carregar contatos", "error");
    } finally { setLoading(false); }
  }, [page, show]);

  React.useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  // Send message
  const handleSend = async () => {
    if (!sendPhone || !sendMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/integracoes/botconversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enviar-mensagem",
          destinatario: sendPhone.replace(/\D/g, ""),
          mensagem: sendMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        show("Mensagem enviada!", "success");
        setSendMessage("");
        setShowSendModal(false);
      } else {
        show(data.error || "Erro ao enviar", "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setSending(false); }
  };

  const filtered = subscribers.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.full_name.toLowerCase().includes(term) || s.phone.includes(term);
  });

  // BotConversa Live Chat URL
  const botconversaBaseUrl = "https://app.botconversa.com.br";
  const liveChatUrl = selectedContact
    ? `${botconversaBaseUrl}/${selectedContact.live_chat}`
    : `${botconversaBaseUrl}/live-chat/all`;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-3 border-b bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <h1 className="text-lg font-bold">Comunicação WhatsApp</h1>
          <Badge variant="outline" className="text-xs">{totalCount} contatos</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("livechat")}
              className={`px-3 py-1.5 text-xs font-medium transition ${viewMode === "livechat" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Live Chat
            </button>
            <button
              onClick={() => setViewMode("contatos")}
              className={`px-3 py-1.5 text-xs font-medium transition ${viewMode === "contatos" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              Contatos
            </button>
          </div>
          <Button size="sm" onClick={() => setShowSendModal(true)}>
            <Send className="h-3.5 w-3.5 mr-1" /> Enviar
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`${botconversaBaseUrl}/live-chat/all`} target="_blank" rel="noopener">
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Abrir BotConversa
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "livechat" ? (
          <>
            {/* Contact sidebar for live chat */}
            <div className="w-[280px] border-r flex flex-col bg-card hidden md:flex">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedContact(null)}
                      className={`w-full text-left px-3 py-2 text-xs border-b hover:bg-muted/50 transition ${!selectedContact ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                    >
                      <p className="font-medium">📋 Todas as conversas</p>
                    </button>
                    {filtered.slice(0, 50).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedContact(s)}
                        className={`w-full text-left px-3 py-2 border-b hover:bg-muted/50 transition flex items-center gap-2 ${selectedContact?.id === s.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                      >
                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{s.full_name}</p>
                          <p className="text-[10px] text-muted-foreground">{formatPhone(s.phone)}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* BotConversa Live Chat iframe */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative bg-muted/20">
                <iframe
                  src={liveChatUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="BotConversa Live Chat"
                  allow="clipboard-write"
                />
              </div>
              <div className="px-3 py-2 border-t bg-card flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  💡 Este é o Live Chat do BotConversa integrado. Todas as mensagens enviadas e recebidas aparecem aqui em tempo real.
                </p>
                <Button size="sm" variant="ghost" onClick={() => fetchSubscribers()}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Atualizar contatos
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Contacts view */
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar contato por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={fetchSubscribers}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Atualizar
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((s) => (
                    <div key={s.id} className="bg-card border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.full_name}</p>
                          <p className="text-xs text-muted-foreground">{formatPhone(s.phone)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
                          setSendPhone(s.phone);
                          setShowSendModal(true);
                        }}>
                          <Send className="h-3 w-3 mr-1" /> Mensagem
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs" asChild>
                          <a href={`${botconversaBaseUrl}/${s.live_chat}`} target="_blank" rel="noopener">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                      {s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.tags.map((t) => (
                            <Badge key={t.id} variant="outline" className="text-[10px]">{t.name}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">Desde {formatDate(s.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalCount > 20 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">Página {page}</span>
                  <Button size="sm" variant="outline" disabled={subscribers.length < 20} onClick={() => setPage(p => p + 1)}>
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSendModal(false)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-600" /> Enviar Mensagem
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSendModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={sendPhone}
                  onChange={(e) => setSendPhone(e.target.value)}
                  placeholder="5548999990001"
                />
                <p className="text-xs text-muted-foreground">DDI + DDD + Número</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem</label>
                <textarea
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  rows={4}
                  placeholder="Digite sua mensagem..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSendModal(false)}>Cancelar</Button>
                <Button onClick={handleSend} disabled={sending || !sendPhone || !sendMessage.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
