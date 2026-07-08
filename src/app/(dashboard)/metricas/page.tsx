"use client";
import * as React from "react";
import { SimpleBarChart } from "@/components/ui/chart-bar";
import { StatRing } from "@/components/ui/stat-ring";
import { Loader2, BarChart3 } from "lucide-react";

export default function MetricasPage() {
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/relatorios/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (!data)
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Erro ao carregar métricas</p>
      </div>
    );

  const kpis = data.kpis as {
    ocupacao: number;
    pacientesAtivos: number;
    evolucoesPendentes: number;
    agendamentosHoje: number;
    inadimplentes: number;
    estoqueBaixo: number;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Métricas</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão gráfica dos indicadores</p>
      </div>

      {/* Rings */}
      <div className="flex flex-wrap gap-8 justify-center bg-card border rounded-xl p-8">
        <StatRing value={kpis.ocupacao} label="Ocupação" color="#0D9488" />
        <StatRing
          value={Math.min(100, Math.round((kpis.pacientesAtivos / 50) * 100))}
          label="Pacientes"
          color="#2563eb"
        />
        <StatRing
          value={kpis.evolucoesPendentes > 0 ? Math.max(10, 100 - kpis.evolucoesPendentes * 10) : 100}
          label="Evoluções em dia"
          color="#7c3aed"
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Indicadores
        </h2>
        <SimpleBarChart
          data={[
            { label: "Pacientes", value: kpis.pacientesAtivos, color: "#0D9488" },
            { label: "Consultas", value: kpis.agendamentosHoje, color: "#2563eb" },
            { label: "Inadimpl.", value: kpis.inadimplentes, color: "#dc2626" },
            { label: "Estoque ↓", value: kpis.estoqueBaixo, color: "#f59e0b" },
            { label: "Evol. pend.", value: kpis.evolucoesPendentes, color: "#7c3aed" },
          ]}
        />
      </div>
    </div>
  );
}
