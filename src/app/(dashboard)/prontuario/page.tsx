"use client";

import * as React from "react";
import { FileHeart, Search, Clock, User, Stethoscope, Brain, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface Evolucao {
  id: string;
  paciente: string;
  tipo: "Médica" | "Psicológica" | "Enfermagem" | "Terapêutica";
  profissional: string;
  resumo: string;
  data: string;
  hora: string;
  assinado: boolean;
}

const evolucoesMock: Evolucao[] = [
  { id: "1", paciente: "Carlos Eduardo Silva", tipo: "Médica", profissional: "Dr. Marcos Vieira", resumo: "Paciente estável, redução gradual de Clonazepam. Sem queixas novas. Apetite preservado.", data: "01/07/2026", hora: "08:30", assinado: true },
  { id: "2", paciente: "Carlos Eduardo Silva", tipo: "Psicológica", profissional: "Dra. Ana Paula", resumo: "Sessão individual: trabalho de prevenção à recaída. Paciente demonstra insight sobre gatilhos.", data: "01/07/2026", hora: "10:00", assinado: true },
  { id: "3", paciente: "Marcos Antônio Oliveira", tipo: "Enfermagem", profissional: "Enf. Paula Santos", resumo: "PA: 120x80, FC: 72, T: 36.2°C. Aceitou medicação. Sono regular. Sem intercorrências.", data: "01/07/2026", hora: "07:00", assinado: true },
  { id: "4", paciente: "João Pedro Ferreira", tipo: "Terapêutica", profissional: "Dr. Ricardo Lima", resumo: "Participação ativa na terapia em grupo. Tema: comunicação familiar. Paciente emocionado ao relatar.", data: "30/06/2026", hora: "16:00", assinado: true },
  { id: "5", paciente: "Thiago Mendes Costa", tipo: "Médica", profissional: "Dr. Marcos Vieira", resumo: "Queixa de insônia. Ajustada medicação noturna. Orientado sobre higiene do sono.", data: "30/06/2026", hora: "09:00", assinado: false },
  { id: "6", paciente: "Lucas Gabriel Santos", tipo: "Psicológica", profissional: "Psic. Fernanda Costa", resumo: "Avaliação inicial concluída. Perfil: alta impulsividade, baixa tolerância à frustração.", data: "30/06/2026", hora: "14:00", assinado: true },
  { id: "7", paciente: "Marcos Antônio Oliveira", tipo: "Médica", profissional: "Dr. Marcos Vieira", resumo: "Exames laboratoriais normais. Manter conduta atual. Reavaliar em 15 dias.", data: "29/06/2026", hora: "11:00", assinado: true },
  { id: "8", paciente: "João Pedro Ferreira", tipo: "Enfermagem", profissional: "Enf. Paula Santos", resumo: "Paciente recusou jantar. Queixa de náusea. Administrado Ondansetrona. Melhora após 30min.", data: "29/06/2026", hora: "19:30", assinado: true },
];

const tipoConfig: Record<string, { color: string; icon: React.ElementType }> = {
  Médica: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Stethoscope },
  Psicológica: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Brain },
  Enfermagem: { color: "bg-pink-100 text-pink-700 border-pink-200", icon: Heart },
  Terapêutica: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: User },
};

export default function ProntuarioPage() {
  const [busca, setBusca] = React.useState("");
  const [filtroTipo, setFiltroTipo] = React.useState<string>("Todas");
  const { show } = useToast();

  const filtradas = evolucoesMock.filter((e) => {
    const matchBusca =
      e.paciente.toLowerCase().includes(busca.toLowerCase()) ||
      e.profissional.toLowerCase().includes(busca.toLowerCase()) ||
      e.resumo.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "Todas" || e.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prontuário Eletrônico</h1>
          <p className="text-sm text-muted-foreground mt-1">Evoluções clínicas e histórico dos pacientes</p>
        </div>
        <Button onClick={() => show("Formulário de evolução em desenvolvimento", "info")}>
          <FileHeart className="h-4 w-4 mr-2" />Nova Evolução
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente, profissional ou conteúdo..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 w-80" />
        </div>
        <div className="flex gap-1">
          {["Todas", "Médica", "Psicológica", "Enfermagem", "Terapêutica"].map((tipo) => (
            <Button
              key={tipo}
              variant={filtroTipo === tipo ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setFiltroTipo(tipo)}
            >
              {tipo}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline de evoluções */}
      <div className="space-y-3">
        {filtradas.map((ev) => {
          const config = tipoConfig[ev.tipo];
          const Icon = config.icon;
          return (
            <div key={ev.id} className="bg-card border rounded-lg p-5 hover:shadow-sm transition">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{ev.paciente}</span>
                    <Badge variant="outline" className={config.color}>{ev.tipo}</Badge>
                    {!ev.assinado && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Não assinado</Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">{ev.resumo}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{ev.profissional}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.data} às {ev.hora}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => show(`${ev.paciente} — ${ev.tipo} (${ev.data} ${ev.hora}): ${ev.resumo}`, "info")}
                >
                  Ver completo
                </Button>
              </div>
            </div>
          );
        })}
        {filtradas.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma evolução encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
