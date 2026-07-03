"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  pacientes: "Pacientes",
  prontuario: "Prontuário",
  agenda: "Agenda",
  financeiro: "Financeiro",
  estoque: "Estoque",
  quartos: "Quartos",
  documentos: "Documentos",
  comunicacao: "Comunicação",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  novo: "Novo",
  editar: "Editar",
  usuarios: "Usuários",
  integracoes: "Integrações",
  audit: "Audit Log",
  "portal-familia": "Portal Família",
  clinica: "Dados da Clínica",
  botconversa: "BotConversa",
  pix: "Pix",
  nfe: "NF-e",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    // Skip UUID segments (show just "Detalhes")
    const isUuid = /^[0-9a-f]{8}-/.test(seg);
    const label = isUuid ? "Detalhes" : pathLabels[seg] || seg;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4 overflow-x-auto">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1 whitespace-nowrap">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
