"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Users,
  FileHeart,
  Calendar,
  Wallet,
  Package,
  BedDouble,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // If undefined, visible to all authenticated users
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pacientes", href: "/pacientes", icon: Users, roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA"] },
  { name: "Prontuário", href: "/prontuario", icon: FileHeart, roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA"] },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Financeiro", href: "/financeiro", icon: Wallet, roles: ["ADMIN", "COORDENADOR", "FINANCEIRO"] },
  { name: "Estoque", href: "/estoque", icon: Package, roles: ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "APOIO"] },
  { name: "Quartos", href: "/quartos", icon: BedDouble, roles: ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "SECRETARIA"] },
  { name: "Documentos", href: "/documentos", icon: FileText, roles: ["ADMIN", "COORDENADOR", "MEDICO", "SECRETARIA", "FINANCEIRO"] },
  { name: "Comunicação", href: "/comunicacao", icon: MessageSquare, roles: ["ADMIN", "COORDENADOR", "SECRETARIA"] },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, roles: ["ADMIN", "COORDENADOR", "FINANCEIRO"] },
  { name: "Configurações", href: "/configuracoes", icon: Settings, roles: ["ADMIN"] },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState<string>("ADMIN");

  // Fetch user role once
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.user?.role) setUserRole(d.user.role); })
      .catch(() => {});
  }, []);

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // continue anyway
      }
      window.location.href = "/login";
    }
  };

  const navContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hachi-logo.png" alt="Hachi" className="h-11 w-11 rounded-md object-contain" />
          <span className="font-bold text-lg text-foreground">Hachi</span>
          <span className="text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
            ERP
          </span>
        </div>
        {/* Close button - mobile only */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex-col">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md hover:bg-muted"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hachi-logo.png" alt="Hachi" className="h-9 w-9 rounded-md object-contain" />
        <span className="font-bold text-foreground">Hachi</span>
      </div>
      <UserAvatar />
    </header>
  );
}

function UserAvatar() {
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUser(d.user); })
      .catch(() => {});
  }, []);

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
        {initials}
      </div>
      <div className="hidden sm:block">
        <p className="text-xs font-medium leading-none">{user.name.split(" ")[0]}</p>
        <p className="text-[10px] text-muted-foreground">{user.role}</p>
      </div>
    </div>
  );
}
