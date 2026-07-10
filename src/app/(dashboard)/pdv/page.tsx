"use client";

import * as React from "react";
import {
  ShoppingCart,
  Plus,
  DoorOpen,
  DoorClosed,
  Wallet,
  Clock,
} from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";

const quickActions = [
  {
    name: "Novo Pedido",
    description: "Registrar um novo pedido",
    icon: Plus,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Abrir Mesa",
    description: "Iniciar atendimento em uma mesa",
    icon: DoorOpen,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    name: "Fechar Mesa",
    description: "Finalizar conta e pagamento",
    icon: DoorClosed,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    name: "Caixa",
    description: "Abrir ou fechar caixa do dia",
    icon: Wallet,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
];

export default function PDVPage() {
  const terms = useTerminology();

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Ponto de Venda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registre vendas e gerencie pedidos
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all text-center group"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">{action.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Últimos Pedidos */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Últimos Pedidos
        </h2>
        <div className="rounded-xl border bg-card p-8 flex flex-col items-center justify-center text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">
            Nenhum pedido registrado hoje
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Os pedidos aparecerão aqui conforme forem criados
          </p>
        </div>
      </div>
    </div>
  );
}
