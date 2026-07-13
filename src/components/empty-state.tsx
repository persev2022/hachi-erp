"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users, Calendar, Wallet, Package, BedDouble, FileText,
  BarChart3, MessageSquare, ClipboardList, Inbox,
} from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  pacientes: Users,
  agenda: Calendar,
  financeiro: Wallet,
  estoque: Package,
  quartos: BedDouble,
  documentos: FileText,
  relatorios: BarChart3,
  comunicacao: MessageSquare,
  prontuario: ClipboardList,
  default: Inbox,
};

interface EmptyStateProps {
  module: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const DEFAULT_CONTENT: Record<string, { title: string; description: string; actionLabel: string; actionHref: string }> = {
  pacientes: {
    title: "Nenhum paciente cadastrado",
    description: "Comece cadastrando o primeiro paciente para utilizar o sistema completo.",
    actionLabel: "Cadastrar paciente",
    actionHref: "/pacientes/novo",
  },
  agenda: {
    title: "Nenhum agendamento",
    description: "Sua agenda está vazia. Crie o primeiro agendamento para organizar sua rotina.",
    actionLabel: "Novo agendamento",
    actionHref: "/agenda",
  },
  financeiro: {
    title: "Nenhuma movimentação",
    description: "Registre receitas e despesas para ter controle financeiro completo.",
    actionLabel: "Nova movimentação",
    actionHref: "/financeiro",
  },
  estoque: {
    title: "Estoque vazio",
    description: "Cadastre itens no estoque para controlar entradas e saídas.",
    actionLabel: "Adicionar item",
    actionHref: "/estoque",
  },
  quartos: {
    title: "Nenhum quarto configurado",
    description: "Configure os quartos/leitos para gerenciar a ocupação.",
    actionLabel: "Configurar quartos",
    actionHref: "/quartos",
  },
  documentos: {
    title: "Nenhum documento",
    description: "Gere contratos, termos e outros documentos automaticamente.",
    actionLabel: "Gerar documento",
    actionHref: "/documentos",
  },
  prontuario: {
    title: "Nenhuma evolução registrada",
    description: "Registre evoluções e prescrições no prontuário eletrônico.",
    actionLabel: "Nova evolução",
    actionHref: "/prontuario",
  },
  comunicacao: {
    title: "Nenhuma mensagem",
    description: "Envie mensagens e comunicados via WhatsApp ou email.",
    actionLabel: "Enviar mensagem",
    actionHref: "/comunicacao",
  },
};

export function EmptyState({ module, title, description, actionLabel, actionHref }: EmptyStateProps) {
  const defaults = DEFAULT_CONTENT[module] || {
    title: "Nenhum dado encontrado",
    description: "Não há registros para exibir no momento.",
    actionLabel: "Voltar",
    actionHref: "/dashboard",
  };

  const Icon = ICONS[module] || ICONS.default;
  const finalTitle = title || defaults.title;
  const finalDesc = description || defaults.description;
  const finalAction = actionLabel || defaults.actionLabel;
  const finalHref = actionHref || defaults.actionHref;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{finalTitle}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm">{finalDesc}</p>
      <Link
        href={finalHref}
        className="mt-5 inline-flex items-center gap-2 bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-teal-700 transition"
      >
        {finalAction}
      </Link>
    </div>
  );
}
