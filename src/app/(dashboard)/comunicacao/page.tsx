"use client";

import * as React from "react";
import { MessageSquare, Send, Phone, Check, CheckCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface Mensagem {
  id: string;
  destinatario: string;
  pacienteRelacionado: string;
  canal: "WhatsApp" | "Email" | "SMS";
  mensagem: string;
  status: "Enviada" | "Entregue" | "Lida" | "Falha";
  dataHora: string;
  tipo: "Lembrete" | "Cobrança" | "Informativo" | "Manual";
}

const mensagensMock: Mensagem[] = [
  { id: "1", destinatario: "Maria Silva (mãe)", pacienteRelacionado: "Carlos Eduardo Silva", canal: "WhatsApp", mensagem: "Lembrete: consulta amanhã às 10h com Dr. Marcos", status: "Lida", dataHora: "01/07 08:00", tipo: "Lembrete" },
  { id: "2", destinatario: "José Oliveira (pai)", pacienteRelacionado: "Marcos Antônio Oliveira", canal: "WhatsApp", mensagem: "Mensalidade de Julho disponível para pagamento via Pix", status: "Entregue", dataHora: "01/07 09:30", tipo: "Cobrança" },
  { id: "3", destinatario: "Ana Ferreira (esposa)", pacienteRelacionado: "João Pedro Ferreira", canal: "WhatsApp", mensagem: "Atualização semanal: João está bem, participando das atividades", status: "Lida", dataHora: "30/06 14:00", tipo: "Informativo" },
  { id: "4", destinatario: "Rosa Costa (mãe)", pacienteRelacionado: "Thiago Mendes Costa", canal: "WhatsApp", mensagem: "URGENTE: Mensalidade Junho em atraso. Favor regularizar.", status: "Enviada", dataHora: "30/06 10:00", tipo: "Cobrança" },
  { id: "5", destinatario: "Pedro Santos (pai)", pacienteRelacionado: "Lucas Gabriel Santos", canal: "Email", mensagem: "Relatório mensal de evolução do tratamento", status: "Entregue", dataHora: "29/06 16:00", tipo: "Informativo" },
  { id: "6", destinatario: "Maria Silva (mãe)", pacienteRelacionado: "Carlos Eduardo Silva", canal: "WhatsApp", mensagem: "Dia de visita: Domingo 06/07, das 14h às 17h", status: "Falha", dataHora: "29/06 11:00", tipo: "Informativo" },
];

const statusIcons: Record<string, React.ElementType> = {
  Enviada: Check,
  Entregue: CheckCheck,
  Lida: CheckCheck,
  Falha: AlertCircle,
};

const statusColors: Record<string, string> = {
  Enviada: "text-muted-foreground",
  Entregue: "text-blue-600",
  Lida: "text-emerald-600",
  Falha: "text-red-600",
};

const tipoColors: Record<string, string> = {
  Lembrete: "bg-blue-100 text-blue-700 border-blue-200",
  Cobrança: "bg-amber-100 text-amber-700 border-amber-200",
  Informativo: "bg-purple-100 text-purple-700 border-purple-200",
  Manual: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function ComunicacaoPage() {
  const { show } = useToast();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunicação</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mensagens via WhatsApp (BotConversa) e outros canais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => show("Fluxos BotConversa em desenvolvimento", "info")}>
            <Phone className="h-4 w-4 mr-2" />
            Enviar Fluxo
          </Button>
          <Button onClick={() => show("Envio de mensagem em desenvolvimento", "info")}>
            <Send className="h-4 w-4 mr-2" />
            Nova Mensagem
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Enviadas Hoje", value: "12", color: "text-blue-600" },
          { label: "Entregues", value: "10", color: "text-emerald-600" },
          { label: "Lidas", value: "7", color: "text-purple-600" },
          { label: "Falhas", value: "1", color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-lg p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de mensagens */}
      <div className="bg-card border rounded-lg divide-y">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Histórico de Mensagens</h2>
          <Input placeholder="Buscar..." className="max-w-xs" />
        </div>
        {mensagensMock.map((msg) => {
          const StatusIcon = statusIcons[msg.status];
          return (
            <div key={msg.id} className="p-4 hover:bg-muted/30 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{msg.destinatario}</p>
                      <Badge variant="outline" className={tipoColors[msg.tipo]}>
                        {msg.tipo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        via {msg.canal}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {msg.mensagem}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paciente: {msg.pacienteRelacionado}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusIcon className={`h-4 w-4 ${statusColors[msg.status]}`} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {msg.dataHora}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
