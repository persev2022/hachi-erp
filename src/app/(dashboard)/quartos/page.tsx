"use client";

import * as React from "react";
import Link from "next/link";
import { BedDouble, User, Wrench, Sparkles, Loader2, Plus, ArrowRightLeft, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DISPONIVEL: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800", icon: BedDouble },
  OCUPADO: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800", icon: User },
  MANUTENCAO: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800", icon: Wrench },
  LIMPEZA: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800", icon: Sparkles },
};
const statusLabel: Record<string, string> = { DISPONIVEL: "Disponível", OCUPADO: "Ocupado", MANUTENCAO: "Manutenção", LIMPEZA: "Limpeza" };

export default function QuartosPage() {
  const [quartos, setQuartos] = React.useState<Quarto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showTransfer, setShowTransfer] = React.useState(false);
  const [showActions, setShowActions] = React.useState<string | null>(null);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const [transferPaciente, setTransferPaciente] = React.useState("");
  const [transferQuarto, setTransferQuarto] = React.useState("");
  const [transferring, setTransferring] = React.useState(false);
  const { show } = useToast();

  const fetchQuartos = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quartos");
      const data = await res.json();
      if (data.success) setQuartos(data.data);
    } catch { show("Erro ao carregar quartos", "error"); }
    finally { setLoading(false); }
  }, [show]);

  React.useEffect(() => { fetchQuartos(); }, [fetchQuartos]);

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100&status=ATIVO")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome }))); })
      .catch(() => {});
  }, []);

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
    setShowActions(null);
  };

  const handleTransfer = async () => {
    if (!transferPaciente || !transferQuarto) { show("Selecione paciente e quarto", "warning"); return; }
    setTransferring(true);
    try {
      const res = await fetch("/api/quartos/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId: transferPaciente, quartoDestinoId: transferQuarto }),
      });
      const data = await res.json();
      if (data.success) { show(data.message || "Transferido!", "success"); setShowTransfer(false); fetchQuartos(); }
      else show(data.error || "Erro", "error");
    } catch { show("Erro de conexão", "error"); }
    finally { setTransferring(false); }
  };

  const ocupados = quartos.filter((q) => q.status === "OCUPADO").length;
  const disponiveis = quartos.filter((q) => q.status === "DISPONIVEL").length;
  const total = quartos.length;
  const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
  const andares = [...new Set(quartos.map((q) => q.andar))].sort();

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Quartos & Leitos</h1>
          <p className="text-sm text-muted-foreground mt-1">Mapa de ocupação e gestão de leitos</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
            <ArrowRightLeft className="h-4 w-4 mr-1" /> Transferir
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{ocupacao}%</p>
          <p className="text-xs text-muted-foreground">Ocupação</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{ocupados}</p>
          <p className="text-xs text-muted-foreground">Ocupados</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{disponiveis}</p>
          <p className="text-xs text-muted-foreground">Disponíveis</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
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

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Transferir Paciente</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTransfer(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paciente</label>
                <select value={transferPaciente} onChange={(e) => setTransferPaciente(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Selecione o paciente</option>
                  {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quarto Destino</label>
                <select value={transferQuarto} onChange={(e) => setTransferQuarto(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Selecione o quarto</option>
                  {quartos.filter((q) => q.status === "DISPONIVEL").map((q) => (
                    <option key={q.id} value={q.id}>{q.numero} ({q.tipo || "—"})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowTransfer(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleTransfer} disabled={transferring}>
                  {transferring && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Transferir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Map */}
      {andares.map((andar) => (
        <div key={andar}>
          <h2 className="text-lg font-semibold mb-3">{andar}º Andar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quartos.filter((q) => q.andar === andar).map((quarto) => {
              const config = statusConfig[quarto.status] || statusConfig.DISPONIVEL;
              const Icon = config.icon;
              return (
                <div key={quarto.id}
                  className={`rounded-lg border p-3 md:p-4 ${config.bg} transition-all hover:shadow-md cursor-pointer relative`}
                  onClick={() => setShowActions(showActions === quarto.id ? null : quarto.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{quarto.numero}</span>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{quarto.tipo || "—"} · Cap: {quarto.capacidade}</p>
                  {quarto.pacientes.length > 0 && (
                    <div className="mt-1.5">
                      {quarto.pacientes.map((p) => (
                        <Link key={p.id} href={`/pacientes/${p.id}`} className="text-xs font-medium truncate block hover:underline" title={p.nome}>
                          {p.nome}
                        </Link>
                      ))}
                    </div>
                  )}
                  {quarto.status === "DISPONIVEL" && <Badge variant="outline" className="mt-2 text-[10px] border-emerald-300 text-emerald-600">Livre</Badge>}

                  {/* Action buttons on click */}
                  {showActions === quarto.id && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-card border rounded-lg shadow-lg p-2 space-y-1">
                      {quarto.status === "DISPONIVEL" && (
                        <>
                          <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={(e) => { e.stopPropagation(); handleStatusChange(quarto.id, "MANUTENCAO"); }}>
                            <Wrench className="h-3 w-3 mr-1" /> Manutenção
                          </Button>
                          <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={(e) => { e.stopPropagation(); handleStatusChange(quarto.id, "OCUPADO"); }}>
                            <User className="h-3 w-3 mr-1" /> Marcar Ocupado
                          </Button>
                        </>
                      )}
                      {quarto.status === "OCUPADO" && (
                        <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={(e) => { e.stopPropagation(); handleStatusChange(quarto.id, "LIMPEZA"); }}>
                          <Sparkles className="h-3 w-3 mr-1" /> Check-out (Limpeza)
                        </Button>
                      )}
                      {quarto.status === "MANUTENCAO" && (
                        <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={(e) => { e.stopPropagation(); handleStatusChange(quarto.id, "DISPONIVEL"); }}>
                          <BedDouble className="h-3 w-3 mr-1" /> Liberar
                        </Button>
                      )}
                      {quarto.status === "LIMPEZA" && (
                        <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={(e) => { e.stopPropagation(); handleStatusChange(quarto.id, "DISPONIVEL"); }}>
                          <BedDouble className="h-3 w-3 mr-1" /> Concluir Limpeza
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {quartos.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum quarto cadastrado.</p>}
    </div>
  );
}
