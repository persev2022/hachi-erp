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
  const botconversaBaseUrl = "https://app.botconversa.com.br/208113";
  const liveChatUrl = selectedContact
    ? `${botconversaBaseUrl}/inbox?tab=all&status=all&chat_id=${selectedContact.id}`
    : `${botconversaBaseUrl}/inbox?tab=all&status=all`;

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
            <a href={`${botconversaBaseUrl}/inbox?tab=all&status=all`} target="_blank" rel="noopener">
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Abrir BotConversa
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "livechat" ? (
          <>
            {/* Contact sidebar */}
            <div className="w-full md:w-[320px] border-r flex flex-col bg-card">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar contato..."
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
                  filtered.slice(0, 50).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedContact(s)}
                      className={`w-full text-left px-3 py-3 border-b hover:bg-muted/50 transition flex items-center gap-3 ${selectedContact?.id === s.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                    >
                      <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{formatPhone(s.phone)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {totalCount > 20 && (
                <div className="p-2 border-t flex justify-center gap-2">
                  <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</Button>
                  <span className="text-xs text-muted-foreground py-1">Pág {page}</span>
                  <Button size="sm" variant="ghost" disabled={subscribers.length < 20} onClick={() => setPage(p => p + 1)}>→</Button>
                </div>
              )}
            </div>

            {/* Right panel - Contact detail + quick actions */}
            <div className="flex-1 flex flex-col hidden md:flex">
              {!selectedContact ? (
                <div className="flex-1 flex items-center justify-center bg-muted/10">
                  <div className="text-center px-8">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground font-medium">Selecione um contato</p>
                    <p className="text-sm text-muted-foreground mt-1">Escolha na lista à esquerda para ver opções e enviar mensagens</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Contact header */}
                  <div className="p-6 border-b bg-card">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User className="h-7 w-7 text-emerald-700" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{selectedContact.full_name}</h2>
                        <p className="text-sm text-muted-foreground">{formatPhone(selectedContact.phone)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Desde {formatDate(selectedContact.created_at)}</p>
                      </div>
                    </div>
                    {selectedContact.tags.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {selectedContact.tags.map((t) => (
                          <Badge key={t.id} variant="outline" className="text-xs">{t.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-6 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="h-auto py-4 flex-col gap-2" onClick={() => {
                        setSendPhone(selectedContact.phone);
                        setShowSendModal(true);
                      }}>
                        <Send className="h-5 w-5" />
                        <span className="text-xs">Enviar Mensagem</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                        <a href={`${botconversaBaseUrl}/inbox?tab=all&status=all&chat_id=${selectedContact.id}`} target="_blank" rel="noopener">
                          <ExternalLink className="h-5 w-5" />
                          <span className="text-xs">Ver Conversa Completa</span>
                        </a>
                      </Button>
                    </div>

                    {/* Quick send */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium">Envio rápido</p>
                      <textarea
                        value={sendMessage}
                        onChange={(e) => setSendMessage(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                      />
                      <Button size="sm" className="w-full" disabled={!sendMessage.trim() || sending} onClick={() => {
                        setSendPhone(selectedContact.phone);
                        handleSend();
                      }}>
                        {sending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                        Enviar para {selectedContact.first_name}
                      </Button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        💡 Para ver o histórico completo de mensagens, clique em "Ver Conversa Completa" — abre direto no chat do BotConversa.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                          <a href={`${botconversaBaseUrl}/inbox?tab=all&status=all&chat_id=${s.id}`} target="_blank" rel="noopener">
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
