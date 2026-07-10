"use client";

import * as React from "react";
import {
  Loader2,
  Syringe,
  Calendar,
  FileText,
  ClipboardList,
  Clock,
  Stethoscope,
} from "lucide-react";
import { useTerminology } from "@/hooks/use-terminology";

interface VerticalTool {
  name: string;
  description: string;
  icon: React.ElementType;
}

function getVerticalTools(vertical: string): VerticalTool[] {
  switch (vertical) {
    case "clinic":
      return [
        { name: "Anamnese", description: "Registro de história clínica", icon: ClipboardList },
        { name: "Convênios TISS", description: "Guias e faturamento", icon: FileText },
        { name: "Exames", description: "Solicitar e visualizar resultados", icon: Stethoscope },
      ];
    case "senior":
      return [
        { name: "Medicação", description: "Controle de medicamentos por residente", icon: Syringe },
        { name: "Atividades", description: "Grade de atividades recreativas", icon: Calendar },
      ];
    case "hotel":
      return [
        { name: "Reservas", description: "Gerenciar reservas e check-in", icon: Calendar },
        { name: "Tarifas", description: "Configurar preços por temporada", icon: FileText },
      ];
    case "education":
      return [
        { name: "Boletim", description: "Notas e faltas por aluno", icon: ClipboardList },
        { name: "Grade Curricular", description: "Disciplinas e professores", icon: FileText },
      ];
    case "vet":
      return [
        { name: "Prontuário Animal", description: "Histórico veterinário", icon: Stethoscope },
        { name: "Carteira Vacinal", description: "Registro de vacinas", icon: Syringe },
      ];
    case "services":
      return [
        { name: "Propostas", description: "Pipeline de propostas comerciais", icon: FileText },
        { name: "Timesheet", description: "Registro de horas por projeto", icon: Clock },
      ];
    default:
      return [];
  }
}

export default function VerticalPage() {
  const terms = useTerminology();
  const [vertical, setVertical] = React.useState<string>("recovery");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/platform")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setVertical(d.platform.tenant?.vertical || "recovery");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tools = getVerticalTools(vertical);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Ferramentas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Funcionalidades específicas da sua vertical
        </p>
      </div>

      {tools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <tool.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            Nenhuma ferramenta específica para esta vertical.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            As funcionalidades principais estão disponíveis no menu lateral.
          </p>
        </div>
      )}
    </div>
  );
}
