"use client";

import * as React from "react";
import { Settings, Users, Shield, Bell, Database, Plug, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface ConfigSection {
  title: string;
  description: string;
  icon: React.ElementType;
  status: "Configurado" | "Pendente" | "Parcial";
  items: string[];
}

const sections: ConfigSection[] = [
  {
    title: "Dados da Clínica",
    description: "Razão social, CNPJ, endereço, logo, dados do responsável técnico",
    icon: Building,
    status: "Configurado",
    items: ["CNPJ: 12.345.678/0001-90", "Alvará: Vigente até 12/2026", "Resp. Técnico: Dr. Marcos Vieira (CRM/SC 12345)"],
  },
  {
    title: "Usuários & Permissões",
    description: "Gerenciar equipe, perfis de acesso e RBAC",
    icon: Users,
    status: "Configurado",
    items: ["8 usuários ativos", "5 perfis configurados", "Último acesso: hoje 08:00"],
  },
  {
    title: "Segurança & LGPD",
    description: "Autenticação, 2FA, política de senhas, audit log",
    icon: Shield,
    status: "Parcial",
    items: ["2FA: Desativado", "Política de senhas: Ativa", "Backup: Diário automático", "Retenção: 20 anos"],
  },
  {
    title: "Notificações",
    description: "Alertas por email, WhatsApp e push interno",
    icon: Bell,
    status: "Configurado",
    items: ["Vencimento financeiro: Ativo", "Estoque baixo: Ativo", "Agendamento: Ativo"],
  },
  {
    title: "Integrações",
    description: "BotConversa, Pix, NF-e, e-SUS",
    icon: Plug,
    status: "Parcial",
    items: ["BotConversa: Conectado ✓", "Pix BACEN: Pendente configuração", "NF-e: Pendente certificado", "e-SUS: Não configurado"],
  },
  {
    title: "Banco de Dados",
    description: "Backup, retenção, performance",
    icon: Database,
    status: "Configurado",
    items: ["PostgreSQL 16", "Último backup: hoje 03:00", "Tamanho: 2.4 GB", "Uptime: 99.9%"],
  },
];

const statusStyles: Record<string, string> = {
  Configurado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pendente: "bg-red-100 text-red-700 border-red-200",
  Parcial: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function ConfiguracoesPage() {
  const { show } = useToast();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie o sistema, integrações e permissões</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-card border rounded-lg p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                    <Badge variant="outline" className={statusStyles[section.status]}>{section.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  <ul className="mt-3 space-y-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => show(`Configurações de ${section.title} em desenvolvimento`, "info")}
              >
                Configurar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
