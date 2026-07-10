"use client";

import * as React from "react";
import { Loader2, Plus, CalendarCheck } from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";

interface Reserva {
  id: string;
  hospedeNome?: string;
  nome?: string;
  quartoId?: string;
  quarto?: string;
  checkin: string;
  checkout: string;
  status: string;
}

export default function ReservasPage() {
  const terms = useTerminology();
  const [reservas, setReservas] = React.useState<Reserva[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/hotel/reservas")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setReservas(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatDate(d: string) {
    try {
      return new Date(d).toLocaleDateString("pt-BR");
    } catch {
      return d;
    }
  }

  function statusColor(status: string) {
    switch (status.toLowerCase()) {
      case "confirmada":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pendente":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelada":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "checkout":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Reservas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie reservas e check-ins
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </button>
      </div>

      {reservas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
          <p className="text-xs text-muted-foreground mt-1">
            Crie uma nova reserva para começar
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Hóspede
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Quarto
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Check-in
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Check-out
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{r.hospedeNome || r.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.quartoId || r.quarto || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(r.checkin)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(r.checkout)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
