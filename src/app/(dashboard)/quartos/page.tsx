"use client";

import * as React from "react";
import { BedDouble, User, Wrench, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-simple";

interface Quarto {
  id: string;
  numero: string;
  andar: number;
  tipo: string | null;
  status: string;
  capacidade: number;
  observacoes: string | null;
  pacientes: { id: string; nome: string }[];
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  DISPONIVEL: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: BedDouble },
  OCUPADO: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: User },
  MANUTENCAO: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Wrench },
  LIMPEZA: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Sparkles },
};

const statusLabel: Record<string, string> = {
  DISPONIVEL: "Disponível",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
};

export default function QuartosPage() {
  const [quartos, setQuartos] = React.useState<Quarto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { show } = useToast();

  const fetchQuartos = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quartos");
      const data = await res.json();
      if (data.success) setQuartos(data.data);
    } catch {
      show("Erro ao carregar quartos", "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  React.useEffect(() => { fetchQuartos(); }, [fetchQuartos]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/quartos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) { show("Status atualizado!", "success"); fetchQuartos(); }
      else show(data.error || "Erro", "error");
    } catch { show("Erro de conexão", "error"); }
  };

  const ocupados = quartos.filter((q) => q.status === "OCUPADO").length;
  const total = quartos.length;
  const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
  const andares = [...new Set(quartos.map((q) => q.andar))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Quartos & Leitos</h1>
          <p className="text-sm text-muted-foreground mt-1">Mapa de ocupação em tempo real</p>
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
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${config.bg} border`} />
            <span className="text-xs text-muted-foreground">{statusLabel[key]}</span>
          </div>
        ))}
      </div>

      {/* Mapa por andar */}
      {andares.map((andar) => (
        <div key={andar}>
          <h2 className="text-lg font-semibold mb-3">{andar}º Andar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quartos
              .filter((q) => q.andar === andar)
              .map((quarto) => {
                const config = statusConfig[quarto.status] || statusConfig.DISPONIVEL;
                const Icon = config.icon;
                return (
                  <div
                    key={quarto.id}
                    className={`rounded-lg border p-3 md:p-4 ${config.bg} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{quarto.numero}</span>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{quarto.tipo || "—"}</p>
                    {quarto.pacientes.length > 0 && (
                      <div className="mt-1.5">
                        {quarto.pacientes.map((p) => (
                          <p key={p.id} className="text-xs font-medium truncate" title={p.nome}>
                            {p.nome}
                          </p>
                        ))}
                      </div>
                    )}
                    {quarto.status === "DISPONIVEL" && (
                      <Badge variant="outline" className="mt-2 text-[10px] border-emerald-300 text-emerald-600">
                        Livre
                      </Badge>
                    )}
                    {quarto.status === "MANUTENCAO" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-[10px] h-6"
                        onClick={() => handleStatusChange(quarto.id, "DISPONIVEL")}
                      >
                        Liberar
                      </Button>
                    )}
                    {quarto.status === "LIMPEZA" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-[10px] h-6"
                        onClick={() => handleStatusChange(quarto.id, "DISPONIVEL")}
                      >
                        Concluir
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {quartos.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Nenhum quarto cadastrado.
        </p>
      )}
    </div>
  );
}
