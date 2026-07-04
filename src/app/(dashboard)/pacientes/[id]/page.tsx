"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Pill,
  FileHeart,
  Wallet,
  BedDouble,
  Clock,
  Loader2,
  Stethoscope,
  Brain,
  Heart,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tab = "resumo" | "evolucoes" | "prescricoes" | "agenda" | "financeiro";

const statusColor: Record<string, string> = {
  ATIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ALTA: "bg-blue-100 text-blue-700 border-blue-200",
  EVADIDO: "bg-red-100 text-red-700 border-red-200",
  TRANSFERIDO: "bg-amber-100 text-amber-700 border-amber-200",
  OBITO: "bg-gray-100 text-gray-700 border-gray-200",
};

const tipoEvolucaoIcon: Record<string, React.ElementType> = {
  MEDICA: Stethoscope,
  PSICOLOGICA: Brain,
  ENFERMAGEM: Heart,
  TERAPEUTICA: User,
  SOCIAL: User,
  NUTRICIONAL: User,
};

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function formatDateTime(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function PacienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [paciente, setPaciente] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<Tab>("resumo");

  // Extra data for tabs
  const [evolucoes, setEvolucoes] = React.useState<any[]>([]);
  const [prescricoes, setPrescricoes] = React.useState<any[]>([]);
  const [loadingTab, setLoadingTab] = React.useState(false);

  React.useEffect(() => {
    async function fetchPaciente() {
      setLoading(true);
      try {
        const res = await fetch(`/api/pacientes/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Erro ao carregar paciente");
          return;
        }
        setPaciente(data.data);
      } catch {
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPaciente();
  }, [id]);

  React.useEffect(() => {
    if (!id) return;

    async function fetchTabData() {
      setLoadingTab(true);
      try {
        if (activeTab === "evolucoes") {
          const res = await fetch(`/api/prontuario/evolucoes?pacienteId=${id}`);
          const data = await res.json();
          if (data.success) setEvolucoes(data.data);
        } else if (activeTab === "prescricoes") {
          const res = await fetch(`/api/prontuario/prescricoes?pacienteId=${id}`);
          const data = await res.json();
          if (data.success) setPrescricoes(data.data);
        }
      } catch {
        // fail silently
      } finally {
        setLoadingTab(false);
      }
    }

    if (activeTab === "evolucoes" || activeTab === "prescricoes") {
      fetchTabData();
    }
  }, [activeTab, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error || "Paciente não encontrado"}
        </div>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/pacientes">← Voltar</Link>
        </Button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "resumo", label: "Resumo", icon: User },
    { key: "evolucoes", label: "Evoluções", icon: FileHeart },
    { key: "prescricoes", label: "Prescrições", icon: Pill },
    { key: "agenda", label: "Agenda", icon: Calendar },
    { key: "financeiro", label: "Financeiro", icon: Wallet },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 self-start">
          <Link href="/pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold truncate">{paciente.nome}</h1>
            <Badge variant="outline" className={statusColor[paciente.status]}>
              {paciente.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            CPF: {paciente.cpf} · Admissão: {formatDate(paciente.dataAdmissao)}
            {paciente.quarto && ` · Quarto ${paciente.quarto.numero}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={async () => {
            const res = await fetch(`/api/pacientes/${id}/exportar`);
            if (res.ok) {
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `dados_paciente.json`;
              document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            }
          }}>Exportar LGPD</Button>
          <Button variant="outline" asChild>
            <Link href={`/pacientes/${id}/editar`}>Editar</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "resumo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Nascimento:</span> {formatDate(paciente.dataNascimento)}</div>
                <div><span className="text-muted-foreground">Sexo:</span> {paciente.sexo === "M" ? "Masculino" : "Feminino"}</div>
                <div><span className="text-muted-foreground">Estado Civil:</span> {paciente.estadoCivil}</div>
                <div><span className="text-muted-foreground">Profissão:</span> {paciente.profissao || "—"}</div>
              </div>
              {paciente.telefone && (
                <div className="flex items-center gap-2 pt-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{paciente.telefone}</span>
                </div>
              )}
              {paciente.endereco && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{paciente.endereco}, {paciente.bairro} - {paciente.cidade}/{paciente.uf}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados Clínicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Dados Clínicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Substância principal:</span> {paciente.substanciaPrincipal || "—"}</div>
              <div><span className="text-muted-foreground">Tempo de uso:</span> {paciente.tempoUso || "—"}</div>
              <div><span className="text-muted-foreground">Internações prévias:</span> {paciente.internacoesPrevias}</div>
              <div><span className="text-muted-foreground">Comorbidades:</span> {paciente.comorbidades || "—"}</div>
              <div><span className="text-muted-foreground">Alergias:</span> {paciente.alergias || "Nenhuma informada"}</div>
            </CardContent>
          </Card>

          {/* Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BedDouble className="h-4 w-4" /> Tratamento Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Admissão:</span> {formatDate(paciente.dataAdmissao)}</div>
              <div><span className="text-muted-foreground">Previsão alta:</span> {formatDate(paciente.dataAltaPrevista)}</div>
              <div><span className="text-muted-foreground">Dias de tratamento:</span> {paciente.diasTratamento} dias</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Quarto:</span>
                <span>{paciente.quarto?.numero || "Não atribuído"}</span>
                <MudarQuartoButton
                  pacienteId={id}
                  quartoAtualId={paciente.quartoId}
                  quartoAtualNumero={paciente.quarto?.numero}
                  onSuccess={(novoQuarto) => {
                    setPaciente((prev: any) => ({
                      ...prev,
                      quartoId: novoQuarto.id,
                      quarto: { ...prev?.quarto, numero: novoQuarto.numero, id: novoQuarto.id },
                    }));
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
          {paciente.responsaveis?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" /> Responsável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {paciente.responsaveis.map((r: any) => (
                  <div key={r.id} className="space-y-1">
                    <div className="font-medium">{r.nome} ({r.parentesco})</div>
                    <div className="text-muted-foreground">{r.telefone}</div>
                    {r.email && <div className="text-muted-foreground">{r.email}</div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Últimas Evoluções (preview) */}
          {paciente.evolucoes?.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileHeart className="h-4 w-4" /> Últimas Evoluções
                </CardTitle>
                <CardDescription>
                  <button
                    className="text-primary hover:underline text-xs"
                    onClick={() => setActiveTab("evolucoes")}
                  >
                    Ver todas →
                  </button>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {paciente.evolucoes.slice(0, 5).map((ev: any) => {
                  const Icon = tipoEvolucaoIcon[ev.tipo] || FileHeart;
                  return (
                    <div key={ev.id} className="flex items-start gap-3 text-sm">
                      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ev.tipo}</span>
                          <span className="text-muted-foreground text-xs">{formatDateTime(ev.createdAt)}</span>
                          {ev.assinado && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        </div>
                        <p className="text-muted-foreground truncate">{ev.conteudo}</p>
                        <p className="text-xs text-muted-foreground">{ev.profissional?.name}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "evolucoes" && (
        <div className="space-y-3">
          {loadingTab ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : evolucoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma evolução registrada.</p>
          ) : (
            evolucoes.map((ev) => {
              const Icon = tipoEvolucaoIcon[ev.tipo] || FileHeart;
              return (
                <Card key={ev.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{ev.tipo}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDateTime(ev.createdAt)}</span>
                          {ev.assinado && (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                              Assinado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mt-2 leading-relaxed">{ev.conteudo}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {ev.profissional?.name} ({ev.profissional?.role})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === "prescricoes" && (
        <div className="space-y-3">
          {loadingTab ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : prescricoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma prescrição registrada.</p>
          ) : (
            prescricoes.map((p) => (
              <Card key={p.id} className={!p.ativa ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{p.medicamento}</span>
                        <Badge variant="outline" className={p.ativa ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}>
                          {p.ativa ? "Ativa" : "Suspensa"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {p.dosagem} — Via {p.via} — {p.frequencia}
                        {p.duracao && ` — ${p.duracao}`}
                      </p>
                      {p.observacoes && (
                        <p className="text-xs text-muted-foreground mt-1">Obs: {p.observacoes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Prescrito por: {p.medico?.name} {p.medico?.crm && `(CRM ${p.medico.crm})`}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(p.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "agenda" && (
        <div className="space-y-3">
          {paciente.agendamentos?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum agendamento próximo.</p>
          ) : (
            paciente.agendamentos?.map((ag: any) => (
              <Card key={ag.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{ag.tipo}</span>
                        <Badge variant="outline">{ag.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDateTime(ag.dataHora)} — {ag.duracao}min
                        {ag.sala && ` — ${ag.sala}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ag.profissional?.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "financeiro" && (
        <FinanceiroTab pacienteId={id} mensalidade={paciente.mensalidadeValor} vencimento={paciente.diaVencimento} />
      )}
    </div>
  );
}

function MudarQuartoButton({
  pacienteId,
  quartoAtualId,
  quartoAtualNumero,
  onSuccess,
}: {
  pacienteId: string;
  quartoAtualId?: string | null;
  quartoAtualNumero?: string | null;
  onSuccess: (novoQuarto: { id: string; numero: string }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [quartos, setQuartos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [transferindo, setTransferindo] = React.useState(false);
  const [erro, setErro] = React.useState("");

  async function loadQuartos() {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/quartos");
      const data = await res.json();
      if (data.success) {
        setQuartos(data.data);
      }
    } catch {
      setErro("Erro ao carregar quartos");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    loadQuartos();
  }

  async function handleTransferir(quartoDestinoId: string, quartoNumero: string) {
    setTransferindo(true);
    setErro("");
    try {
      const res = await fetch("/api/quartos/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, quartoDestinoId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErro(data.error || "Erro ao transferir");
        return;
      }
      onSuccess({ id: quartoDestinoId, numero: quartoNumero });
      setOpen(false);
    } catch {
      setErro("Erro de conexão");
    } finally {
      setTransferindo(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={handleOpen}>
        <RefreshCw className="h-3 w-3 mr-1" />
        Mudar
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <h3 className="font-semibold text-base">Mudar Quarto</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Atual: {quartoAtualNumero || "Sem quarto"} → Selecione o novo quarto
              </p>
              {erro && <p className="text-sm text-destructive mt-2">{erro}</p>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : quartos.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum quarto cadastrado.</p>
              ) : (
                quartos.map((q) => {
                  const isAtual = q.id === quartoAtualId;
                  const ocupacao = q.pacientes?.length || 0;
                  const disponivel = ocupacao < q.capacidade && q.status !== "MANUTENCAO" && q.status !== "LIMPEZA";
                  const lotado = !disponivel && !isAtual;

                  return (
                    <button
                      key={q.id}
                      disabled={isAtual || lotado || transferindo}
                      onClick={() => handleTransferir(q.id, q.numero)}
                      className={`w-full text-left p-3 rounded-lg border transition text-sm ${
                        isAtual
                          ? "border-primary bg-primary/5 cursor-default"
                          : lotado
                          ? "border-muted bg-muted/30 opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Quarto {q.numero}</span>
                          {isAtual && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                              Atual
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ocupacao}/{q.capacidade} ocupado{ocupacao !== 1 ? "s" : ""}
                        </div>
                      </div>
                      {q.pacientes?.length > 0 && !isAtual && (
                        <p className="text-xs text-muted-foreground mt-1 pl-6">
                          {q.pacientes.map((p: any) => p.nome.split(" ")[0]).join(", ")}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FinanceiroTab({ pacienteId, mensalidade, vencimento }: { pacienteId: string; mensalidade?: number | null; vencimento?: number | null }) {
  const [movs, setMovs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/financeiro?pacienteId=${pacienteId}&pageSize=50`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setMovs(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pacienteId]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const pagos = movs.filter((m) => m.status === "PAGO");
  const pendentes = movs.filter((m) => m.status === "PENDENTE" || m.status === "ATRASADO");
  const totalPago = pagos.reduce((s, m) => s + m.valor, 0);
  const totalPendente = pendentes.reduce((s, m) => s + m.valor, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Mensalidade</p>
          <p className="text-lg font-bold">R$ {mensalidade?.toFixed(2) || "—"}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Vencimento</p>
          <p className="text-lg font-bold">Dia {vencimento || "—"}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Pago</p>
          <p className="text-lg font-bold text-emerald-600">R$ {totalPago.toFixed(2)}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Pendente</p>
          <p className="text-lg font-bold text-amber-600">R$ {totalPendente.toFixed(2)}</p>
        </div>
      </div>
      {movs.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">Nenhuma movimentação financeira.</p>
      ) : (
        <div className="space-y-2">
          {movs.slice(0, 20).map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{m.descricao}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.dataVencimento).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${m.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"}`}>
                  R$ {m.valor.toFixed(2)}
                </p>
                <Badge variant="outline" className={`text-xs ${m.status === "PAGO" ? "bg-emerald-50 text-emerald-700" : m.status === "ATRASADO" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                  {m.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
