"use client";

import * as React from "react";
import { BedDouble, User, Wrench, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Quarto {
  numero: string;
  andar: number;
  tipo: string;
  status: "Disponível" | "Ocupado" | "Manutenção" | "Limpeza";
  paciente?: string;
  capacidade: number;
}

const quartosMock: Quarto[] = [
  { numero: "Q-101", andar: 1, tipo: "Individual", status: "Ocupado", paciente: "Carlos Eduardo Silva", capacidade: 1 },
  { numero: "Q-102", andar: 1, tipo: "Individual", status: "Ocupado", paciente: "Marcos Antônio Oliveira", capacidade: 1 },
  { numero: "Q-103", andar: 1, tipo: "Individual", status: "Ocupado", paciente: "Thiago Mendes Costa", capacidade: 1 },
  { numero: "Q-104", andar: 1, tipo: "Duplo", status: "Disponível", capacidade: 2 },
  { numero: "Q-105", andar: 1, tipo: "Duplo", status: "Limpeza", capacidade: 2 },
  { numero: "Q-201", andar: 2, tipo: "Individual", status: "Ocupado", paciente: "João Pedro Ferreira", capacidade: 1 },
  { numero: "Q-202", andar: 2, tipo: "Individual", status: "Ocupado", paciente: "Lucas Gabriel Santos", capacidade: 1 },
  { numero: "Q-203", andar: 2, tipo: "Duplo", status: "Disponível", capacidade: 2 },
  { numero: "Q-204", andar: 2, tipo: "Individual", status: "Manutenção", capacidade: 1 },
  { numero: "Q-205", andar: 2, tipo: "Duplo", status: "Disponível", capacidade: 2 },
];

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Disponível: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: BedDouble },
  Ocupado: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: User },
  Manutenção: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Wrench },
  Limpeza: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Sparkles },
};

export default function QuartosPage() {
  const ocupados = quartosMock.filter((q) => q.status === "Ocupado").length;
  const total = quartosMock.length;
  const ocupacao = Math.round((ocupados / total) * 100);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quartos & Leitos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mapa de ocupação em tempo real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold">{ocupacao}%</p>
            <p className="text-xs text-muted-foreground">Ocupação</p>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-primary flex items-center justify-center">
            <span className="text-xs font-bold">{ocupados}/{total}</span>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${config.bg} border`} />
            <span className="text-xs text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>

      {/* Mapa de quartos por andar */}
      {[1, 2].map((andar) => (
        <div key={andar}>
          <h2 className="text-lg font-semibold mb-3">{andar}º Andar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quartosMock
              .filter((q) => q.andar === andar)
              .map((quarto) => {
                const config = statusConfig[quarto.status];
                const Icon = config.icon;
                return (
                  <div
                    key={quarto.numero}
                    className={`rounded-lg border p-4 ${config.bg} transition-all hover:shadow-md cursor-pointer`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{quarto.numero}</span>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{quarto.tipo}</p>
                    {quarto.paciente && (
                      <p className="text-xs font-medium mt-1.5 truncate" title={quarto.paciente}>
                        {quarto.paciente}
                      </p>
                    )}
                    {quarto.status === "Disponível" && (
                      <Badge variant="outline" className="mt-2 text-[10px] border-emerald-300 text-emerald-600">
                        Livre
                      </Badge>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
