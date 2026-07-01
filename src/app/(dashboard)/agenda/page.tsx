"use client";

import * as React from "react";
import { Calendar, Clock, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Agendamento {
  id: string;
  hora: string;
  paciente: string;
  profissional: string;
  tipo: string;
  sala: string;
  status: "Agendado" | "Confirmado" | "Concluído" | "Cancelado";
}

const agendamentosMock: Agendamento[] = [
  { id: "1", hora: "07:30", paciente: "Carlos Eduardo Silva", profissional: "Dr. Marcos Vieira", tipo: "Consulta Psiquiátrica", sala: "Sala 1", status: "Concluído" },
  { id: "2", hora: "08:00", paciente: "Marcos Antônio Oliveira", profissional: "Dra. Ana Paula", tipo: "Terapia Individual", sala: "Sala 2", status: "Concluído" },
  { id: "3", hora: "09:00", paciente: "João Pedro Ferreira", profissional: "Enf. Paula Santos", tipo: "Avaliação Enfermagem", sala: "Enfermaria", status: "Confirmado" },
  { id: "4", hora: "10:00", paciente: "Thiago Mendes Costa", profissional: "Dr. Ricardo Lima", tipo: "Terapia em Grupo", sala: "Sala Grupo", status: "Confirmado" },
  { id: "5", hora: "11:00", paciente: "Lucas Gabriel Santos", profissional: "Dra. Ana Paula", tipo: "Terapia Individual", sala: "Sala 2", status: "Agendado" },
  { id: "6", hora: "14:00", paciente: "Carlos Eduardo Silva", profissional: "Dr. Marcos Vieira", tipo: "Revisão de Medicação", sala: "Sala 1", status: "Agendado" },
  { id: "7", hora: "15:00", paciente: "Marcos Antônio Oliveira", profissional: "Psic. Fernanda Costa", tipo: "Avaliação Psicológica", sala: "Sala 3", status: "Agendado" },
  { id: "8", hora: "16:00", paciente: "João Pedro Ferreira", profissional: "Dr. Ricardo Lima", tipo: "Terapia Individual", sala: "Sala 2", status: "Agendado" },
];

const statusStyles: Record<string, string> = {
  Agendado: "bg-amber-100 text-amber-700 border-amber-200",
  Confirmado: "bg-blue-100 text-blue-700 border-blue-200",
  Concluído: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelado: "bg-red-100 text-red-700 border-red-200",
};

export default function AgendaPage() {
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{hoje}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Resumo do dia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Hoje", value: "8", icon: Calendar },
          { label: "Concluídos", value: "2", icon: Clock },
          { label: "Pendentes", value: "6", icon: Clock },
          { label: "Profissionais", value: "5", icon: User },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline do dia */}
      <div className="bg-card border rounded-lg divide-y">
        {agendamentosMock.map((ag) => (
          <div key={ag.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition">
            <div className="text-center w-14 shrink-0">
              <p className="text-lg font-bold text-foreground">{ag.hora.split(":")[0]}</p>
              <p className="text-xs text-muted-foreground">:{ag.hora.split(":")[1]}</p>
            </div>
            <div className="h-10 w-0.5 bg-border rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{ag.paciente}</p>
                <Badge variant="outline" className={statusStyles[ag.status]}>
                  {ag.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ag.tipo} — {ag.profissional} — {ag.sala}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Detalhes
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
