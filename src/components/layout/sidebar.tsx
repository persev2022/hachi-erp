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
  PieChart,
  Settings,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  UserCheck,
  CalendarCheck,
  ShoppingCart,
  Truck,
  Wrench,
  FileSignature,
  UserPlus,
} from "lucide-react";
import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSelector } from "@/components/locale-selector";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // If undefined, visible to all authenticated users
  feature?: string; // Feature flag key — if set, item only shows when feature is enabled
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pacientes", href: "/pacientes", icon: Users, roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA"] },
  { name: "Prontuário", href: "/prontuario", icon: FileHeart, roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA"], feature: "prontuario" },
  { name: "Agenda", href: "/agenda", icon: Calendar, feature: "agenda" },
  { name: "Financeiro", href: "/financeiro", icon: Wallet, roles: ["ADMIN", "FINANCEIRO"], feature: "financeiro" },
  { name: "Estoque", href: "/estoque", icon: Package, roles: ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "APOIO"], feature: "estoque" },
  { name: "Quartos", href: "/quartos", icon: BedDouble, roles: ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "SECRETARIA"], feature: "quartos" },
  { name: "Documentos", href: "/documentos", icon: FileText, roles: ["ADMIN", "COORDENADOR", "MEDICO", "SECRETARIA", "FINANCEIRO"], feature: "documentos" },
  { name: "Comunicação", href: "/comunicacao", icon: MessageSquare, roles: ["ADMIN", "COORDENADOR", "SECRETARIA"], feature: "comunicacao" },
  { name: "CRM", href: "/crm", icon: UserCheck, roles: ["ADMIN", "COORDENADOR", "SECRETARIA"], feature: "crm" },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, roles: ["ADMIN", "FINANCEIRO"], feature: "relatorios" },
  { name: "Métricas", href: "/metricas", icon: PieChart, roles: ["ADMIN", "FINANCEIRO", "COORDENADOR"], feature: "relatorios" },
  { name: "Configurações", href: "/configuracoes", icon: Settings, roles: ["ADMIN"], feature: "configuracoes" },
  { name: "Reservas", href: "/reservas", icon: CalendarCheck, roles: ["ADMIN", "COORDENADOR", "SECRETARIA"], feature: "reservas" },
  { name: "PDV", href: "/pdv", icon: ShoppingCart, roles: ["ADMIN", "FINANCEIRO"], feature: "pdv" },
  { name: "Delivery", href: "/delivery", icon: Truck, roles: ["ADMIN", "COORDENADOR"], feature: "delivery" },
  { name: "Ferramentas", href: "/vertical", icon: Wrench, roles: ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA", "FINANCEIRO"] },
  { name: "Captadores", href: "/captadores", icon: UserPlus, roles: ["ADMIN", "COORDENADOR", "SECRETARIA"] },
  { name: "Formulários", href: "/formularios", icon: FileSignature, roles: ["ADMIN", "COORDENADOR", "SECRETARIA"] },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState<string>("ADMIN");
  const [features, setFeatures] = React.useState<Record<string, boolean> | null>(null);
  const [tenantName, setTenantName] = React.useState<string | null>(null);
  const [terminology, setTerminology] = React.useState<Record<string, string> | null>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [brandColor, setBrandColor] = React.useState<string | null>(null);
  const [brandLogo, setBrandLogo] = React.useState<string | null>(null);

  // Fetch user role, platform features, and terminology once
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.user?.role) setUserRole(d.user.role); })
      .catch(() => {});

    fetch("/api/platform")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFeatures(d.platform.features);
          if (d.platform.tenant?.name && d.platform.tenant.name !== "Hachi") {
            setTenantName(d.platform.tenant.name);
          }
        }
      })
      .catch(() => {});

    fetch("/api/platform/terminology")
      .then((r) => r.json())
      .then((d) => { if (d.success) setTerminology(d.terminology); })
      .catch(() => {});

    fetch("/api/platform/branding")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.primaryColor) setBrandColor(d.primaryColor);
          if (d.logo) setBrandLogo(d.logo);
        }
      })
      .catch(() => {});

    // Fetch unread notifications count
    const fetchUnread = () => {
      fetch("/api/notifications/count")
        .then((r) => r.json())
        .then((d) => { if (d.success) setUnreadCount(d.unread); })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply terminology to nav items
  function getNavLabel(item: NavItem): string {
    if (!terminology) return item.name;
    if (item.href === "/pacientes") return terminology.paciente ? `${terminology.paciente}s` : item.name;
    if (item.href === "/prontuario") return terminology.evolucao ? `${terminology.evolucao}s` : item.name;
    if (item.href === "/quartos") return terminology.quartos || item.name;
    return item.name;
  }

  const filteredNav = navigation.filter((item) => {
    if (item.roles && !item.roles.includes(userRole)) return false;
    if (features && item.feature && !features[item.feature]) return false;
    return true;
  });

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
          <img src={brandLogo || "/images/hachi-logo.png"} alt="Hachi" className="h-11 w-11 rounded-md object-contain" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg text-foreground">Hachi</span>
              <span className="text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                Platform
              </span>
            </div>
            {tenantName && (
              <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[140px]">
                {tenantName}
              </span>
            )}
          </div>
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
                  style={isActive && brandColor ? { backgroundColor: brandColor, color: "#fff" } : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {getNavLabel(item)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        {unreadCount > 0 && (
          <Link href="/notifications" onClick={onClose} className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4" />
              Notificações
            </div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadCount}</span>
          </Link>
        )}
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <LocaleSelector />
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
        {/* Note: mobile header uses static logo; branding logo applies to sidebar only */}
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
