"use client";

import {
  Users,
  BedDouble,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  // TODO: Buscar dados reais via React Query
  const stats = [
    { label: "Pacientes Ativos", value: "24", icon: Users, color: "text-hachi-teal-500" },
    { label: "Ocupação", value: "80%", icon: BedDouble, color: "text-emerald-600" },
    { label: "Consultas Hoje", value: "12", icon: Calendar, color: "text-blue-600" },
    { label: "Receita Mensal", value: "R$ 156k", icon: DollarSign, color: "text-hachi-gold-500" },
    { label: "Taxa Adesão", value: "92%", icon: TrendingUp, color: "text-green-600" },
    { label: "Inadimplência", value: "3", icon: AlertTriangle, color: "text-red-500" },
    { label: "Mensagens Hoje", value: "47", icon: MessageSquare, color: "text-purple-600" },
    { label: "Docs Gerados", value: "8", icon: FileText, color: "text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da clínica — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      {/* Seções do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Agendamentos */}
        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Próximos Agendamentos</h2>
          <div className="space-y-3">
            {[
              { hora: "08:00", paciente: "João da Silva", tipo: "Consulta Psiquiátrica", prof: "Dr. Marcos" },
              { hora: "09:00", paciente: "Maria Santos", tipo: "Terapia Individual", prof: "Dra. Ana" },
              { hora: "10:30", paciente: "Carlos Oliveira", tipo: "Avaliação Enfermagem", prof: "Enf. Paula" },
              { hora: "14:00", paciente: "Pedro Lima", tipo: "Terapia em Grupo", prof: "Dr. Ricardo" },
            ].map((agenda, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-md bg-muted/50 hover:bg-muted transition">
                <span className="text-sm font-mono text-muted-foreground w-12">{agenda.hora}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{agenda.paciente}</p>
                  <p className="text-xs text-muted-foreground">{agenda.tipo} — {agenda.prof}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Alertas</h2>
          <div className="space-y-3">
            {[
              { msg: "3 mensalidades vencidas", tipo: "financeiro" },
              { msg: "Estoque de Clonazepam baixo", tipo: "estoque" },
              { msg: "Alvará vence em 15 dias", tipo: "compliance" },
              { msg: "2 evoluções pendentes", tipo: "clinico" },
            ].map((alerta, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{alerta.msg}</p>
                  <p className="text-xs text-muted-foreground capitalize">{alerta.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
