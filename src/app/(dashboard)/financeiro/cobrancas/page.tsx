"use client";

import * as React from "react";
import Link from "next/link";
import {
  Loader2, AlertTriangle, CheckCircle2, Clock, Users, DollarSign,
  Phone, Mail, CalendarDays, ArrowLeft, ChevronDown, ChevronUp,
  Bell, Send, Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

export default function CobrancasPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"todos" | "atrasados" | "pendentes" | "pagos">("todos");
  const [gerando, setGerando] = React.useState(false);
  const { show } = useToast();
  const terms = useTerminology();

  const gerarMensalidades = async () => {
    setGerando(true);
    try {
      const res = await fetch("/api/financeiro/gerar-mensalidades", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const d = await res.json();
      if (d.success) {
        show(d.message, "success");
        // Refresh data
        const res2 = await fetch("/api/financeiro/cobrancas");
        const d2 = await res2.json();
        if (d2.success) setData(d2.data);
      } else {
        show(d.error || "Erro ao gerar", "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setGerando(false); }
  };

  React.useEffect(() => {
    fetch("/api/financeiro/cobrancas")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePagar = async (movId: string) => {
    try {
      const res = await fetch(`/api/financeiro/${movId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAGO", formaPagamento: "Pix", dataPagamento: new Date().toISOString() }),
      });
      const d = await res.json();
      if (d.success) {
        show("Pagamento registrado!", "success");
        // Refresh
        const res2 = await fetch("/api/financeiro/cobrancas");
        const d2 = await res2.json();
        if (d2.success) setData(d2.data);
      } else {
        show(d.error || "Erro", "error");
      }
    } catch { show("Erro de conexão", "error"); }
  };

  const copyCobranca = (c: any) => {
    const msg = `Olá ${c.responsavel?.nome || ""}! 🙂\n\nLembramos que a mensalidade de ${c.pacienteNome} no valor de R$ ${c.mensalidadeValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} vence dia ${c.diaVencimento}/${String(new Date().getMonth() + 1).padStart(2, "0")}.\n\nQualquer dúvida estamos à disposição!\n\n— Equipe CT Persev`;
    navigator.clipboard.writeText(msg);
    show("Mensagem de cobrança copiada!", "success");
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando cobranças...</p>
    </div>
  );

  if (!data) return <div className="p-8 text-muted-foreground">Sem dados de cobrança.</div>;

  const { resumo, vencendoEm7Dias, cobrancas } = data;
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  // Filter logic
  const filtered = cobrancas.filter((c: any) => {
    if (filter === "atrasados") return c.totalAtrasados > 0;
    if (filter === "pendentes") return c.statusMesAtual === "PENDENTE" || c.statusMesAtual === "SEM_REGISTRO";
    if (filter === "pagos") return c.statusMesAtual === "PAGO";
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/financeiro"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cobranças & Vencimentos</h1>
            <p className="text-sm text-muted-foreground">Controle de mensalidades por {terms.paciente.toLowerCase()} e responsável</p>
          </div>
        </div>
        <Button size="sm" onClick={gerarMensalidades} disabled={gerando}>
          {gerando ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CalendarDays className="h-3.5 w-3.5 mr-1" />}
          Gerar Mensalidades
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{resumo.totalAcolhidosAtivos}</p>
            <p className="text-[9px] text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
            <p className="text-lg font-bold text-emerald-600">{fmt(resumo.totalMensalidadePrevista)}</p>
            <p className="text-[9px] text-muted-foreground">Previsto/mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
            <p className="text-2xl font-bold text-emerald-600">{resumo.pagosMesAtual}</p>
            <p className="text-[9px] text-muted-foreground">Pagos (mês)</p>
          </CardContent>
        </Card>
        <Card className={resumo.acolhidosComAtraso > 0 ? "border-red-200" : ""}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-600" />
            <p className="text-2xl font-bold text-red-600">{resumo.acolhidosComAtraso}</p>
            <p className="text-[9px] text-muted-foreground">Com Atraso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{resumo.taxaAdimplencia}%</p>
            <p className="text-[9px] text-muted-foreground">Adimplência</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas: vencendo em 7 dias */}
      {vencendoEm7Dias && vencendoEm7Dias.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" /> Vencendo nos Próximos 7 Dias
              <Badge variant="outline" className="text-[9px] ml-auto">{vencendoEm7Dias.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {vencendoEm7Dias.map((c: any) => (
                <div key={c.pacienteId} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-background border">
                  <div>
                    <p className="text-xs font-medium">{c.pacienteNome}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.responsavel?.nome || "Sem resp."} · Dia {c.diaVencimento}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{fmt(c.mensalidadeValor)}</p>
                    <p className="text-[9px] text-amber-600">{c.diasAteVencimento === 0 ? "HOJE" : `${c.diasAteVencimento}d`}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
        {[
          { id: "todos", label: `Todos (${cobrancas.length})` },
          { id: "atrasados", label: `Atrasados (${cobrancas.filter((c: any) => c.totalAtrasados > 0).length})` },
          { id: "pendentes", label: `Pendentes (${cobrancas.filter((c: any) => c.statusMesAtual === "PENDENTE" || c.statusMesAtual === "SEM_REGISTRO").length})` },
          { id: "pagos", label: `Pagos (${cobrancas.filter((c: any) => c.statusMesAtual === "PAGO").length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === t.id ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cobranças List */}
      <div className="space-y-2">
        {filtered.map((c: any) => {
          const isExpanded = expandedId === c.pacienteId;
          const statusColor = c.totalAtrasados > 0 ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" :
            c.statusMesAtual === "PAGO" ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10" : "";

          return (
            <div key={c.pacienteId} className={`border rounded-lg overflow-hidden ${statusColor}`}>
              {/* Main row */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedId(isExpanded ? null : c.pacienteId)}
              >
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  c.totalAtrasados > 0 ? "bg-red-500" :
                  c.statusMesAtual === "PAGO" ? "bg-emerald-500" :
                  "bg-amber-500"
                }`} />

                {/* Patient info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{c.pacienteNome}</p>
                    {c.totalAtrasados > 0 && (
                      <Badge variant="destructive" className="text-[8px]">{c.totalAtrasados} atrasada(s)</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Resp: {c.responsavel?.nome || "Não cadastrado"} {c.responsavel?.parentesco ? `(${c.responsavel.parentesco})` : ""}
                  </p>
                </div>

                {/* Value + Due */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{fmt(c.mensalidadeValor)}</p>
                  <p className="text-[10px] text-muted-foreground">Dia {c.diaVencimento}</p>
                </div>

                {/* Status badge */}
                <Badge variant="outline" className={`text-[9px] shrink-0 ${
                  c.statusMesAtual === "PAGO" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  c.statusMesAtual === "ATRASADO" ? "bg-red-100 text-red-700 border-red-200" :
                  "bg-amber-100 text-amber-700 border-amber-200"
                }`}>
                  {c.statusMesAtual === "PAGO" ? "PAGO" : c.statusMesAtual === "ATRASADO" ? "ATRASADO" : "PENDENTE"}
                </Badge>

                {/* Expand icon */}
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t p-4 bg-muted/20 space-y-4">
                  {/* Contact + Actions */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 space-y-1">
                      {c.responsavel && (
                        <>
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{c.responsavel.telefone}</span>
                            {c.responsavel.telefone && (
                              <a
                                href={`https://wa.me/55${c.responsavel.telefone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline text-[10px]"
                              >
                                WhatsApp →
                              </a>
                            )}
                          </div>
                          {c.responsavel.email && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{c.responsavel.email}</span>
                            </div>
                          )}
                        </>
                      )}
                      {c.totalAtrasados > 0 && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          ⚠️ Valor total em atraso: {fmt(c.valorAtrasado)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => copyCobranca(c)}>
                        <Copy className="h-3 w-3 mr-1" /> Copiar Cobrança
                      </Button>
                      {c.responsavel?.telefone && (
                        <a
                          href={`https://wa.me/55${c.responsavel.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${c.responsavel.nome}! Lembramos que a mensalidade de ${c.pacienteNome} (R$ ${c.mensalidadeValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) vence dia ${c.diaVencimento}. Qualquer dúvida estamos à disposição!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                            <Send className="h-3 w-3 mr-1" /> Cobrar via WhatsApp
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Histórico de pagamentos */}
                  {c.historico && c.historico.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2">Histórico de Mensalidades</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="p-1.5 text-left">Vencimento</th>
                              <th className="p-1.5 text-right">Valor</th>
                              <th className="p-1.5 text-center">Status</th>
                              <th className="p-1.5 text-left">Pagamento</th>
                              <th className="p-1.5 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.historico.map((h: any) => (
                              <tr key={h.id} className="border-b last:border-0">
                                <td className="p-1.5">{formatDateUTC(h.dataVencimento)}</td>
                                <td className="p-1.5 text-right font-medium">{fmt(h.valor)}</td>
                                <td className="p-1.5 text-center">
                                  <Badge variant="outline" className={`text-[8px] ${
                                    h.status === "PAGO" ? "bg-emerald-100 text-emerald-700" :
                                    h.status === "ATRASADO" ? "bg-red-100 text-red-700" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>{h.status}</Badge>
                                </td>
                                <td className="p-1.5 text-muted-foreground">
                                  {h.dataPagamento ? `${formatDateUTC(h.dataPagamento)} · ${h.formaPagamento || "—"}` : "—"}
                                </td>
                                <td className="p-1.5 text-right">
                                  {(h.status === "PENDENTE" || h.status === "ATRASADO") && (
                                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => handlePagar(h.id)}>
                                      ✓ Pagar
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhum registro para o filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateUTC(d: string) {
  try {
    const date = new Date(d);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch { return "—"; }
}
