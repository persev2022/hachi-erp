"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  BedDouble,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileHeart,
  Package,
  Loader2,
} from "lucide-react";

interface DashboardData {
  kpis: {
    pacientesAtivos: number;
    ocupacao: number;
    agendamentosHoje: number;
    receitaMes: number;
    inadimplentes: number;
    evolucoesPendentes: number;
    estoqueBaixo: number;
  };
  proximosAgendamentos: {
    id: string;
    hora: string;
    paciente: string;
    tipo: string;
    profissional: string;
  }[];
  alertas: { msg: string; tipo: string }[];
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<string>("");
  const [features, setFeatures] = React.useState<Record<string, boolean> | null>(null);

  const fetchData = React.useCallback(() => {
    fetch("/api/relatorios/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchData();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.user?.role) setUserRole(d.user.role); })
      .catch(() => {});
    fetch("/api/platform")
      .then((r) => r.json())
      .then((d) => { if (d.success) setFeatures(d.platform.features); })
      .catch(() => {});
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse bg-muted rounded" />
          <div className="h-4 w-72 animate-pulse bg-muted rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 md:p-5 space-y-2">
              <div className="h-3 w-20 animate-pulse bg-muted rounded" />
              <div className="h-7 w-16 animate-pulse bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-card border rounded-lg p-4 md:p-5 lg:col-span-2 space-y-3">
            <div className="h-5 w-40 animate-pulse bg-muted rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-muted/50 rounded" />
            ))}
          </div>
          <div className="bg-card border rounded-lg p-4 md:p-5 space-y-3">
            <div className="h-5 w-24 animate-pulse bg-muted rounded" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-muted/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  const stats = [
    { label: "Pacientes Ativos", value: String(kpis?.pacientesAtivos ?? 0), icon: Users, color: "text-blue-600", href: "/pacientes", roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA"], feature: undefined },
    { label: "Ocupação", value: `${kpis?.ocupacao ?? 0}%`, icon: BedDouble, color: "text-emerald-600", href: "/quartos", roles: ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "SECRETARIA"], feature: "quartos" },
    { label: "Consultas Hoje", value: String(kpis?.agendamentosHoje ?? 0), icon: Calendar, color: "text-indigo-600", href: "/agenda", roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA", "MONITOR"], feature: "agenda" },
    { label: "Receita Mensal", value: `R$ ${((kpis?.receitaMes ?? 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-amber-600", href: "/financeiro", roles: ["ADMIN", "FINANCEIRO"], feature: "financeiro" },
    { label: "Inadimplentes", value: String(kpis?.inadimplentes ?? 0), icon: AlertTriangle, color: "text-red-500", href: "/financeiro", roles: ["ADMIN", "FINANCEIRO"], feature: "financeiro" },
    { label: "Evoluções Pendentes", value: String(kpis?.evolucoesPendentes ?? 0), icon: FileHeart, color: "text-purple-600", href: "/prontuario", roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA"], feature: "prontuario" },
    { label: "Estoque Baixo", value: String(kpis?.estoqueBaixo ?? 0), icon: Package, color: "text-orange-600", href: "/estoque", roles: ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "APOIO"], feature: "estoque" },
  ];

  const filteredStats = stats.filter((s) => {
    if (userRole && !s.roles.includes(userRole)) return false;
    if (features && s.feature && !features[s.feature]) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Visão geral — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-card border rounded-lg p-4 md:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.color} opacity-80`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Próximos Agendamentos */}
        <div className="bg-card border rounded-lg p-4 md:p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Próximos Agendamentos</h2>
          {data?.proximosAgendamentos && data.proximosAgendamentos.length > 0 ? (
            <div className="space-y-2">
              {data.proximosAgendamentos.map((ag) => (
                <div
                  key={ag.id}
                  className="flex items-center gap-3 md:gap-4 p-3 rounded-md bg-muted/50 hover:bg-muted transition"
                >
                  <span className="text-sm font-mono text-muted-foreground w-12">{ag.hora}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ag.paciente}</p>
                    <p className="text-xs text-muted-foreground">{ag.tipo} — {ag.profissional}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum agendamento pendente para hoje.</p>
          )}
        </div>

        {/* Alertas */}
        <div className="bg-card border rounded-lg p-4 md:p-5">
          <h2 className="text-lg font-semibold mb-4">Alertas</h2>
          {data?.alertas && data.alertas.length > 0 ? (
            <div className="space-y-2">
              {data.alertas.map((alerta, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{alerta.msg}</p>
                    <p className="text-xs text-muted-foreground capitalize">{alerta.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              ✓ Nenhum alerta no momento
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
