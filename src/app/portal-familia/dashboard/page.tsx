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
} from "lucide-react";

interface DadosPortal {
  paciente: {
    nome: string;
    status: string;
    dataAdmissao: string;
    diasTratamento: number;
  };
  evolucoes: Array<{
    tipo: string;
    data: string;
    profissional: string;
  }>;
  agendamentos: Array<{
    tipo: string;
    dataHora: string;
    profissional: string;
  }>;
  financeiro: {
    pendentes: number;
    pagos: number;
  };
  ultimaComunicacao: {
    canal: string;
    assunto: string | null;
    status: string;
    data: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  ATIVO: "Em tratamento",
  ALTA: "Alta médica",
  EVADIDO: "Evadido",
  TRANSFERIDO: "Transferido",
  OBITO: "Óbito",
};

const statusColors: Record<string, string> = {
  ATIVO: "bg-emerald-100 text-emerald-700",
  ALTA: "bg-blue-100 text-blue-700",
  EVADIDO: "bg-amber-100 text-amber-700",
  TRANSFERIDO: "bg-purple-100 text-purple-700",
  OBITO: "bg-gray-100 text-gray-700",
};

const tipoEvolucaoLabels: Record<string, string> = {
  MEDICA: "Médica",
  PSICOLOGICA: "Psicológica",
  ENFERMAGEM: "Enfermagem",
  TERAPEUTICA: "Terapêutica",
  SOCIAL: "Social",
  NUTRICIONAL: "Nutricional",
};

export default function PortalFamiliaDashboard() {
  const router = useRouter();
  const [dados, setDados] = React.useState<DadosPortal | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const token = localStorage.getItem("family-token");
    if (!token) {
      router.push("/portal-familia");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/portal-familia/dados", {
          headers: { "X-Family-Token": token },
        });

        if (res.status === 401) {
          localStorage.removeItem("family-token");
          localStorage.removeItem("family-paciente");
          router.push("/portal-familia");
          return;
        }

        const data = await res.json();
        if (data.success) {
          setDados(data.data);
        } else {
          setError(data.error || "Erro ao carregar dados");
        }
      } catch {
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!dados) return null;

  return (
    <div className="space-y-6">
      {/* Patient header */}
      <div className="bg-white rounded-lg border p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {dados.paciente.nome}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={statusColors[dados.paciente.status] || "bg-gray-100 text-gray-700"}>
              {statusLabels[dados.paciente.status] || dados.paciente.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Admissão: {new Date(dados.paciente.dataAdmissao).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            <span className="text-3xl font-bold">{dados.paciente.diasTratamento}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">dias em tratamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Last evolutions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Últimas Evoluções
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dados.evolucoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma evolução registrada</p>
            ) : (
              <div className="space-y-3">
                {dados.evolucoes.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {tipoEvolucaoLabels[e.tipo] || e.tipo}
                      </p>
                      <p className="text-xs text-muted-foreground">{e.profissional}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next appointments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dados.agendamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
            ) : (
              <div className="space-y-3">
                {dados.agendamentos.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{a.tipo}</p>
                      <p className="text-xs text-muted-foreground">{a.profissional}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.dataHora).toLocaleDateString("pt-BR")}{" "}
                      {new Date(a.dataHora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Situação Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{dados.financeiro.pendentes}</p>
                <p className="text-xs text-muted-foreground">pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{dados.financeiro.pagos}</p>
                <p className="text-xs text-muted-foreground">pagos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last communication */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Última Comunicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!dados.ultimaComunicacao ? (
              <p className="text-sm text-muted-foreground">Nenhuma comunicação enviada</p>
            ) : (
              <div>
                <p className="text-sm font-medium">
                  {dados.ultimaComunicacao.assunto || "Sem assunto"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {dados.ultimaComunicacao.canal}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(dados.ultimaComunicacao.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
