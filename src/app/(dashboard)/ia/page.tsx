"use client";

import * as React from "react";
import { Brain, Send, Loader2, TrendingUp, AlertTriangle, Zap, Bot, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Insight {
  previsao: { receitaPrevista: number; previsaoRealista: number; taxaRecebimento: number; pacientesAtivos: number; ticketMedio: number } | null;
  alertas: { tipo: string; severidade: string; mensagem: string }[];
  automacoes: { id: string; nome: string; descricao: string; status: string }[];
}

export default function IAPage() {
  const [insights, setInsights] = React.useState<Insight | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [chatMessages, setChatMessages] = React.useState<{ role: string; content: string }[]>([]);
  const [inputMsg, setInputMsg] = React.useState("");
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/ia/insights").then(r => r.json()).then(d => { if (d.success) setInsights(d.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!inputMsg.trim()) return;
    const msg = inputMsg.trim();
    setInputMsg("");
    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    setSending(true);
    try {
      const res = await fetch("/api/ia/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.data?.response || "Erro" }]);
    } catch { setChatMessages(prev => [...prev, { role: "assistant", content: "Erro de conexão" }]); }
    finally { setSending(false); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> Inteligência Artificial</h1>
        <p className="text-sm text-muted-foreground mt-1">Insights, previsões e assistente inteligente</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Previsão de Receita */}
          {insights?.previsao && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Previsão de Receita — Próximo Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-50"><p className="text-xs text-muted-foreground">Previsto</p><p className="text-lg font-bold text-blue-700">{fmt(insights.previsao.receitaPrevista)}</p></div>
                  <div className="text-center p-3 rounded-lg bg-emerald-50"><p className="text-xs text-muted-foreground">Projeção Realista</p><p className="text-lg font-bold text-emerald-700">{fmt(insights.previsao.previsaoRealista)}</p></div>
                  <div className="text-center p-3 rounded-lg bg-purple-50"><p className="text-xs text-muted-foreground">Taxa Recebimento</p><p className="text-lg font-bold text-purple-700">{insights.previsao.taxaRecebimento}%</p></div>
                  <div className="text-center p-3 rounded-lg bg-teal-50"><p className="text-xs text-muted-foreground">Pacientes Ativos</p><p className="text-lg font-bold text-teal-700">{insights.previsao.pacientesAtivos}</p></div>
                  <div className="text-center p-3 rounded-lg bg-amber-50"><p className="text-xs text-muted-foreground">Ticket Médio</p><p className="text-lg font-bold text-amber-700">{fmt(insights.previsao.ticketMedio)}</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertas Proativos */}
          {insights?.alertas && insights.alertas.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Alertas Proativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.alertas.map((a, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${a.severidade === "critical" ? "bg-red-50 border-red-200" : a.severidade === "warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                    <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${a.severidade === "critical" ? "text-red-500" : a.severidade === "warning" ? "text-amber-500" : "text-blue-500"}`} />
                    <div>
                      <p className="text-sm font-medium">{a.mensagem}</p>
                      <Badge variant="outline" className="text-[10px] mt-1">{a.tipo}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Automações Sugeridas */}
          {insights?.automacoes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Automações Inteligentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.automacoes.map((a) => (
                    <AutomacaoCard key={a.id} automacao={a} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Chat com IA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> Assistente IA — Pergunte em linguagem natural</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 mb-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Pergunte sobre receita, ocupação, inadimplência, pacientes...</p>
                <p className="text-xs mt-1">Exemplos: "Qual a receita prevista?" · "Quantos inadimplentes temos?" · "Como está a ocupação?"</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="bg-card border rounded-xl px-4 py-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
          </div>
          <div className="flex gap-2">
            <Input value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }} placeholder="Pergunte sobre seus dados..." className="flex-1" />
            <Button onClick={handleSend} disabled={sending || !inputMsg.trim()}><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AutomacaoCard({ automacao }: { automacao: { id: string; nome: string; descricao: string; status: string } }) {
  const [ativo, setAtivo] = React.useState(false);

  return (
    <div className={`p-4 rounded-lg border transition ${ativo ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{automacao.nome}</p>
        <button
          onClick={() => setAtivo(!ativo)}
          className={`relative w-10 h-5 rounded-full transition-colors ${ativo ? "bg-primary" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${ativo ? "left-5.5 translate-x-0.5" : "left-0.5"}`} style={{ left: ativo ? "22px" : "2px" }} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{automacao.descricao}</p>
      {ativo && (
        <p className="text-[10px] text-primary font-medium mt-2">✓ Automação ativa — executará automaticamente</p>
      )}
    </div>
  );
}
