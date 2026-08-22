"use client";

import * as React from "react";
import {
  Loader2, TrendingUp, TrendingDown, Users, BedDouble, Activity,
  Clock, AlertTriangle, Heart, BarChart3, Calendar, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IndicadoresPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/indicadores")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!data) return <div className="p-8 text-muted-foreground">Sem dados disponíveis.</div>;

  const { resumo, indicadores, altasPorTipo } = data;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Indicadores de Qualidade
        </h1>
        <p className="text-sm text-muted-foreground">KPIs operacionais e assistenciais</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Pacientes" value={resumo.totalPacientes} color="primary" />
        <StatCard icon={Heart} label="Ativos" value={resumo.ativos} color="emerald" />
        <StatCard icon={BedDouble} label="Capacidade" value={resumo.capacidadeTotal} color="blue" />
        <StatCard icon={BedDouble} label="Vagas Livres" value={resumo.vagasDisponiveis} color={resumo.vagasDisponiveis > 0 ? "emerald" : "red"} />
      </div>

      {/* Main Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <IndicatorCard
          label="Taxa de Ocupação"
          value={`${indicadores.taxaOcupacao}%`}
          description="Pacientes ativos / capacidade total"
          good={indicadores.taxaOcupacao >= 70}
          benchmark="Meta: > 70%"
        />
        <IndicatorCard
          label="Taxa de Evasão"
          value={`${indicadores.taxaEvasao}%`}
          description="Evadidos / total de saídas"
          good={indicadores.taxaEvasao <= 15}
          benchmark="Meta: < 15%"
          inverted
        />
        <IndicatorCard
          label="Média Permanência"
          value={`${indicadores.mediaPermanencia}d`}
          description="Dias médios em tratamento"
          good={indicadores.mediaPermanencia >= 60}
          benchmark="Meta: > 60 dias"
        />
        <IndicatorCard
          label="Reincidência"
          value={`${indicadores.taxaReincidencia}%`}
          description="Pacientes com internações prévias"
          good={indicadores.taxaReincidencia <= 30}
          benchmark="Benchmark: < 30%"
          inverted
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <IndicatorCard
          label="Evoluções/Paciente"
          value={`${indicadores.evolucoesPorPaciente}`}
          description="Média por paciente (30 dias)"
          good={indicadores.evolucoesPorPaciente >= 4}
          benchmark="Meta: ≥ 4/mês"
        />
        <IndicatorCard
          label="Presença Agenda"
          value={`${indicadores.taxaPresenca}%`}
          description="Concluídos / (Concluídos + Faltas)"
          good={indicadores.taxaPresenca >= 80}
          benchmark="Meta: > 80%"
        />
        <IndicatorCard
          label="Inadimplência"
          value={`${indicadores.taxaInadimplencia}%`}
          description="Mensalidades atrasadas / total"
          good={indicadores.taxaInadimplencia <= 10}
          benchmark="Meta: < 10%"
          inverted
        />
        <IndicatorCard
          label="Evoluções (30d)"
          value={`${indicadores.evolucoes30d}`}
          description="Total de evoluções registradas"
          good={indicadores.evolucoes30d > 0}
          benchmark="Volume operacional"
        />
      </div>

      {/* Altas por tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Desfechos (últimos 6 meses)
          </CardTitle>
          <CardDescription>Classificação das saídas por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(altasPorTipo).map(([tipo, count]) => {
              const configs: Record<string, { label: string; color: string }> = {
                ALTA: { label: "Alta Médica", color: "text-emerald-600" },
                EVADIDO: { label: "Evasão", color: "text-red-600" },
                TRANSFERIDO: { label: "Transferência", color: "text-blue-600" },
                DESISTENCIA: { label: "Desistência", color: "text-amber-600" },
                OBITO: { label: "Óbito", color: "text-gray-600" },
              };
              const cfg = configs[tipo] || { label: tipo, color: "text-foreground" };
              return (
                <div key={tipo} className="text-center p-3 rounded-lg bg-muted/30">
                  <p className={`text-2xl font-bold ${cfg.color}`}>{count as number}</p>
                  <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = { primary: "text-primary", emerald: "text-emerald-600", blue: "text-blue-600", red: "text-red-600" };
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Icon className={`h-4 w-4 mx-auto mb-1 ${colors[color]}`} />
        <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        <p className="text-[9px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function IndicatorCard({ label, value, description, good, benchmark, inverted }: {
  label: string; value: string; description: string; good: boolean; benchmark: string; inverted?: boolean;
}) {
  return (
    <Card className={`${good ? "border-emerald-200/50" : "border-red-200/50"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
          {good ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
        </div>
        <p className={`text-2xl font-bold ${good ? "text-emerald-600" : "text-red-600"}`}>{value}</p>
        <p className="text-[9px] text-muted-foreground mt-1">{description}</p>
        <Badge variant="outline" className="text-[8px] mt-2">{benchmark}</Badge>
      </CardContent>
    </Card>
  );
}
