"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, Users, FileHeart, Calendar, Wallet, Package, BedDouble, FileText, BarChart3, Settings, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface SearchResult {
  id: string;
  name: string;
  href: string;
  type: "page" | "patient";
}

const pages: SearchResult[] = [
  { id: "dashboard", name: "Dashboard", href: "/dashboard", type: "page" },
  { id: "pacientes", name: "Pacientes", href: "/pacientes", type: "page" },
  { id: "prontuario", name: "Prontuário", href: "/prontuario", type: "page" },
  { id: "agenda", name: "Agenda", href: "/agenda", type: "page" },
  { id: "financeiro", name: "Financeiro", href: "/financeiro", type: "page" },
  { id: "estoque", name: "Estoque", href: "/estoque", type: "page" },
  { id: "quartos", name: "Quartos", href: "/quartos", type: "page" },
  { id: "documentos", name: "Documentos", href: "/documentos", type: "page" },
  { id: "comunicacao", name: "Comunicação", href: "/comunicacao", type: "page" },
  { id: "relatorios", name: "Relatórios", href: "/relatorios", type: "page" },
  { id: "configuracoes", name: "Configurações", href: "/configuracoes", type: "page" },
];

const pageIcons: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  pacientes: Users,
  prontuario: FileHeart,
  agenda: Calendar,
  financeiro: Wallet,
  estoque: Package,
  quartos: BedDouble,
  documentos: FileText,
  comunicacao: MessageSquare,
  relatorios: BarChart3,
  configuracoes: Settings,
};

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [patients, setPatients] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search patients when query changes
  React.useEffect(() => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pacientes?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPatients(
            data.data.slice(0, 5).map((p: { id: string; nome: string }) => ({
              id: p.id,
              name: p.nome,
              href: `/pacientes/${p.id}`,
              type: "patient" as const,
            }))
          );
        }
      } catch {
        // Ignore abort errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [...filteredPages, ...patients];

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Busca rápida</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas ou pacientes..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {query.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Digite para buscar páginas ou pacientes...
            </div>
          )}

          {query.length > 0 && filteredPages.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Páginas
              </div>
              {filteredPages.map((result) => {
                const Icon = pageIcons[result.id] || LayoutDashboard;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{result.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {query.length >= 2 && patients.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Pacientes
              </div>
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
                >
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{patient.name}</span>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !loading && allResults.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          )}

          {loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Buscando...
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>
            <kbd className="rounded border bg-muted px-1 py-0.5">↑↓</kbd> navegar
          </span>
          <span>
            <kbd className="rounded border bg-muted px-1 py-0.5">⏎</kbd> abrir
          </span>
          <span>
            <kbd className="rounded border bg-muted px-1 py-0.5">esc</kbd> fechar
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
