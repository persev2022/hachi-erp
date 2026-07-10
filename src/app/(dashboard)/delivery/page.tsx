"use client";

import * as React from "react";
import { Truck, ChefHat, MapPin, CheckCircle2 } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";

const statusCards = [
  {
    label: "Em preparo",
    icon: ChefHat,
    count: 0,
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  {
    label: "A caminho",
    icon: MapPin,
    count: 0,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  {
    label: "Entregue",
    icon: CheckCircle2,
    count: 0,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
];

export default function DeliveryPage() {
  const terms = useTerminology();

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Delivery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie pedidos de entrega
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statusCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-5 ${card.color} flex items-center gap-4`}
          >
            <div className="h-10 w-10 rounded-lg bg-background/80 flex items-center justify-center">
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.count}</p>
              <p className="text-xs font-medium opacity-80">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-xl border bg-card p-10 flex flex-col items-center justify-center text-center">
        <Truck className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground font-medium">
          Nenhum pedido de delivery ativo
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Novos pedidos de entrega aparecerão aqui em tempo real
        </p>
      </div>
    </div>
  );
}
