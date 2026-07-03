"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Calendar,
  DollarSign,
  MessageSquare,
  Clock,
  Pill,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Heart,
  Stethoscope,
  Brain,
} from "lucide-react";

interface DadosPortal {
  paciente: {
    nome: string;
    status: string;
    dataAdmissao: string;
    dataAltaPrevista: string | null;
    diasTratamento: number;
    diasEmTratamento: number;
    progressoPercentual: number;
    substanciaPrincipal: string | null;
    quarto: string | null;
  };
  familiarNome: string;
  evolucoes: Array<{ tipo: string; data: string; profissional: string; role: string; assinado: boolean }>;
  evolucoesMes: Array<{ tipo: string; quantidade: number }>;
  atividadeSemana: Array<{ tipo: string; quantidade: number }>;
  agendamentos: Array<{ tipo: string; dataHora: string; duracao: number; status: string; sala: string | null; profissional: string; role: string }>;
  agendamentosPassados: Array<{ tipo: string; dataHora: string; profissional: string }>;
  financeiro: { pendentes: number; pagos: number; atrasados: number; total: number };
  comunicacoes: Array<{ canal: string; assunto: string | null; status: string; data: string }>;
  prescricoesAtivas: number;
}

const statusLabels: Record<string, string> = {
  ATIVO: "Em tratamento", ALTA: "Alta médica", EVADIDO: "Evadido", TRANSFERIDO: "Transferido", OBITO: "Óbito",
};
const statusColors: Record<string, string> = {
  ATIVO: "bg-emerald-100 text-emerald-700", ALTA: "bg-blue-100 text-blue-700",
  EVADIDO: "bg-amber-100 text-amber-700", TRANSFERIDO: "bg-purple-100 text-purple-700",
};
const tipoLabels: Record<string, string> = {
  MEDICA: "Médica", PSICOLOGICA: "Psicológica", ENFERMAGEM: "Enfermagem",
  TERAPEUTICA: "Terapêutica", SOCIAL: "Social", NUTRICIONAL: "Nutricional",
};
const tipoIcons: Record<string, React.ElementType> = {
  MEDICA: Stethoscope, PSICOLOGICA: Brain, ENFERMAGEM: Heart,
  TERAPEUTICA: Activity, SOCIAL: MessageSquare, NUTRICIONAL: Activity,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function PortalFamiliaDashboard() {
  const router = useRouter();
  const [dados, setDados] = React.useState<DadosPortal | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"resumo" | "evolucoes" | "agenda" | "financeiro">("resumo");

  React.useEffect(() => {
    const token = localStorage.getItem("family-token");
    if (!token) { router.push("/portal-familia"); return; }

    (async () => {
      try {
        const res = await fetch("/api/portal-familia/dados", { headers: { "X-Family-Token": token } });
        if (res.status === 401) { localStorage.removeItem("family-token"); router.push("/portal-familia"); return; }
        const data = await res.json();
        if (data.success) setDados(data.data);
        else setError(data.error || "Erro ao carregar");
      } catch { setError("Erro de conexão"); }
      finally { setLoading(false); }
    })();
  }, [router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Carregando informações...</p>
    </div>
  );
  if (error) return <div className="text-center py-12 text-destructive">{error}</div>;
  if (!dados) return null;

  const tabs = [
    { key: "resumo" as const, label: "Resumo" },
    { key: "evolucoes" as const, label: "Evoluções" },
    { key: "agenda" as const, label: "Agenda" },
    { key: "financeiro" as const, label: "Financeiro" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome + Patient Header */}
      <div className="bg-card rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">Olá, {dados.familiarNome}</p>
        <h1 className="text-2xl font-bold mt-1">{dados.paciente.nome}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Badge className={statusColors[dados.paciente.status] || "bg-gray-100"}>
            {statusLabels[dados.paciente.status] || dados.paciente.status}
          </Badge>
          {dados.paciente.quarto && <Badge variant="outline">Quarto {dados.paciente.quarto}</Badge>}
          {dados.prescricoesAtivas > 0 && (
            <Badge variant="outline" className="gap-1"><Pill className="h-3 w-3" />{dados.prescricoesAtivas} medicamentos ativos</Badge>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso do tratamento</span>
            <span className="font-semibold">{dados.paciente.progressoPercentual}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${dados.paciente.progressoPercentual}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Dia {dados.paciente.diasEmTratamento} de {dados.paciente.diasTratamento}</span>
            {dados.paciente.dataAltaPrevista && (
              <span>Alta prevista: {formatDate(dados.paciente.dataAltaPrevista)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{dados.paciente.diasEmTratamento}</p>
          <p className="text-xs text-muted-foreground">dias internado</p>
        </Card>
        <Card className="p-4 text-center">
          <Activity className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
          <p className="text-2xl font-bold">{dados.evolucoes.length}</p>
          <p className="text-xs text-muted-foreground">evoluções recentes</p>
        </Card>
        <Card className="p-4 text-center">
          <Calendar className="h-5 w-5 mx-auto text-blue-600 mb-1" />
          <p className="text-2xl font-bold">{dados.agendamentos.length}</p>
          <p className="text-xs text-muted-foreground">consultas agendadas</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-purple-600 mb-1" />
          <p className="text-2xl font-bold">{dados.atividadeSemana.reduce((s, a) => s + a.quantidade, 0)}</p>
          <p className="text-xs text-muted-foreground">atividades esta semana</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Tab: Resumo */}
      {activeTab === "resumo" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Activity this month */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Atendimentos no Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dados.evolucoesMes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem atividades registradas este mês</p>
              ) : (
                <div className="space-y-2">
                  {dados.evolucoesMes.map((e) => {
                    const Icon = tipoIcons[e.tipo] || Activity;
                    return (
                      <div key={e.tipo} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{tipoLabels[e.tipo] || e.tipo}</span>
                        </div>
                        <Badge variant="outline">{e.quantidade}x</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next appointment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Próximo Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dados.agendamentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
              ) : (
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="font-medium">{dados.agendamentos[0].tipo}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(dados.agendamentos[0].dataHora)} — {dados.agendamentos[0].duracao}min
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dados.agendamentos[0].profissional}
                    {dados.agendamentos[0].sala && ` · ${dados.agendamentos[0].sala}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Communications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Comunicações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dados.comunicacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma comunicação enviada</p>
              ) : (
                <div className="space-y-2">
                  {dados.comunicacoes.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm">{c.assunto || c.canal}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(c.data)}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" /> Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-emerald-600">{dados.financeiro.pagos}</p>
                  <p className="text-xs text-muted-foreground">pagos</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-600">{dados.financeiro.pendentes}</p>
                  <p className="text-xs text-muted-foreground">pendentes</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">{dados.financeiro.atrasados}</p>
                  <p className="text-xs text-muted-foreground">atrasados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Evoluções */}
      {activeTab === "evolucoes" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Registro de atendimentos realizados pela equipe. Por questões de privacidade, apenas o tipo e profissional são exibidos.
          </p>
          {dados.evolucoes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma evolução registrada</p>
          ) : (
            dados.evolucoes.map((e, i) => {
              const Icon = tipoIcons[e.tipo] || Activity;
              return (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{tipoLabels[e.tipo] || e.tipo}</span>
                        {e.assinado && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {e.profissional} · {formatDate(e.data)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Agenda */}
      {activeTab === "agenda" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-3">Próximos Agendamentos</h3>
            {dados.agendamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhum agendamento futuro</p>
            ) : (
              <div className="space-y-2">
                {dados.agendamentos.map((a, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-center w-14 shrink-0">
                        <p className="text-lg font-bold">{new Date(a.dataHora).getDate()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.dataHora).toLocaleDateString("pt-BR", { month: "short" })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{a.tipo}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} — {a.duracao}min · {a.profissional}
                          {a.sala && ` · ${a.sala}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">{a.status === "CONFIRMADO" ? "Confirmado" : "Agendado"}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {dados.agendamentosPassados.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Atendimentos Realizados</h3>
              <div className="space-y-1">
                {dados.agendamentosPassados.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm">{a.tipo}</p>
                      <p className="text-xs text-muted-foreground">{a.profissional}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(a.dataHora)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Financeiro */}
      {activeTab === "financeiro" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Resumo da situação financeira. Para detalhes de valores, entre em contato com a secretaria.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 text-center border-emerald-200">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <p className="text-3xl font-bold text-emerald-600">{dados.financeiro.pagos}</p>
              <p className="text-sm text-muted-foreground mt-1">mensalidades pagas</p>
            </Card>
            <Card className="p-5 text-center border-amber-200">
              <Clock className="h-8 w-8 mx-auto text-amber-600 mb-2" />
              <p className="text-3xl font-bold text-amber-600">{dados.financeiro.pendentes}</p>
              <p className="text-sm text-muted-foreground mt-1">pendentes</p>
            </Card>
            <Card className="p-5 text-center border-red-200">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="text-3xl font-bold text-red-600">{dados.financeiro.atrasados}</p>
              <p className="text-sm text-muted-foreground mt-1">em atraso</p>
            </Card>
          </div>
          {dados.financeiro.atrasados > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ Existem {dados.financeiro.atrasados} parcela(s) em atraso. Entre em contato com a secretaria para regularização.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
