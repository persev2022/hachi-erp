"use client";

import * as React from "react";
import { Brain, Send, Loader2, TrendingUp, AlertTriangle, Zap, Bot, DollarSign, Activity, Search, FileImage, FileText, Sparkles } from "lucide-react";
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

      {/* AI Tools — Search, Vision, Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Semantic Search */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Busca Inteligente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Busque evoluções por significado, não apenas palavras-chave</p>
            <SemanticSearch />
          </CardContent>
        </Card>

        {/* Document Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><FileImage className="h-4 w-4 text-primary" /> Analisar Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Envie foto de receita, exame ou atestado para a IA ler</p>
            <DocumentAnalyzer />
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Resumo Clínico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Gere resumo inteligente das evoluções ou previsão financeira</p>
            <AISummary />
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
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

// ═══ Semantic Search Component ═══
function SemanticSearch() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [method, setMethod] = React.useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/ia/busca", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      const data = await res.json();
      if (data.success) { setResults(data.data); setMethod(data.method); }
    } catch {} finally { setSearching(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} placeholder="Ex: ansiedade, insônia..." className="text-xs h-8" />
        <Button size="sm" className="h-8 px-2" onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        </Button>
      </div>
      {method && <Badge variant="outline" className="text-[9px]">{method === "semantic" ? "🧠 Busca semântica" : "📝 Busca textual"}</Badge>}
      {results.length > 0 && (
        <div className="max-h-[150px] overflow-y-auto space-y-1">
          {results.slice(0, 5).map((r: any, i: number) => (
            <div key={i} className="text-[10px] p-2 rounded bg-muted/50 border">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[8px]">{r.tipo}</Badge>
                <span className="text-muted-foreground">{r.paciente?.nome?.split(" ")[0]}</span>
                {r.relevanceScore && <span className="ml-auto text-primary font-bold">{r.relevanceScore}%</span>}
              </div>
              <p className="mt-1 line-clamp-2">{r.conteudo?.slice(0, 100)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ Document Analyzer Component ═══
function DocumentAnalyzer() {
  const [result, setResult] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/ia/analisar-documento", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: base64 }) });
        const data = await res.json();
        setResult(data.success ? data.data.analysis : data.error);
      };
      reader.readAsDataURL(file);
    } catch { setResult("Erro ao processar"); }
    finally { setTimeout(() => setAnalyzing(false), 2000); }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
        <FileImage className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{analyzing ? "Analisando..." : "Clique para enviar imagem"}</span>
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>
      {analyzing && <div className="flex items-center gap-2 text-xs"><Loader2 className="h-3 w-3 animate-spin" /> Lendo documento com IA...</div>}
      {result && <div className="text-[10px] p-2 rounded bg-muted/50 border max-h-[120px] overflow-y-auto whitespace-pre-wrap">{result}</div>}
    </div>
  );
}

// ═══ AI Summary Component ═══
function AISummary() {
  const [summary, setSummary] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const generate = async (tipo: string) => {
    setLoading(true);
    setSummary("");
    try {
      const res = await fetch("/api/ia/resumir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo }) });
      const data = await res.json();
      setSummary(data.success ? data.data.summary : data.error);
    } catch { setSummary("Erro"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => generate("financeiro")} disabled={loading}>
          <DollarSign className="h-3 w-3 mr-1" /> Previsão Financeira
        </Button>
      </div>
      {loading && <div className="flex items-center gap-2 text-xs"><Loader2 className="h-3 w-3 animate-spin" /> Gerando análise com IA...</div>}
      {summary && <div className="text-[10px] p-2 rounded bg-muted/50 border max-h-[150px] overflow-y-auto whitespace-pre-wrap">{summary}</div>}
    </div>
  );
}
