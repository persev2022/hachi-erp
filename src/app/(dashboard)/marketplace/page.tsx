"use client";

import * as React from "react";
import {
  Package, Search, Check, Download, Trash2, Loader2,
  Users, ShoppingCart, Truck, Video, UserCheck, BarChart3,
  FileSignature, Heart, MessageSquare, Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

const ICON_MAP: Record<string, React.ElementType> = {
  Users, ShoppingCart, Truck, Video, UserCheck, BarChart3,
  FileSignature, Heart, MessageSquare, Calculator,
};

interface MarketplaceModule {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  icon: string;
  features: string[];
  installed: boolean;
}

export default function MarketplacePage() {
  const { show } = useToast();
  const [modules, setModules] = React.useState<MarketplaceModule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("Todos");

  React.useEffect(() => {
    fetch("/api/platform/marketplace")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setModules(d.data.modules);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (moduleId: string, action: "install" | "uninstall") => {
    setActionLoading(moduleId);
    try {
      const res = await fetch("/api/platform/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setModules((prev) =>
          prev.map((m) => m.id === moduleId ? { ...m, installed: action === "install" } : m)
        );
        show(data.message, "success");
      } else {
        show(data.error, "error");
      }
    } catch {
      show("Erro de conexão", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const categories = ["Todos", ...Array.from(new Set(modules.map((m) => m.category)))];

  const filtered = modules.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Todos" || m.category === category;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-teal-600" />
          <h1 className="text-xl font-bold">Marketplace</h1>
          <Badge variant="outline" className="text-xs">{modules.length} módulos</Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Instale e gerencie módulos adicionais para expandir as funcionalidades da sua plataforma.
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar módulos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                category === cat
                  ? "bg-teal-600 text-white border-teal-600"
                  : "border-gray-200 text-muted-foreground hover:border-teal-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod) => {
          const Icon = ICON_MAP[mod.icon] || Package;
          const isLoading = actionLoading === mod.id;

          return (
            <div
              key={mod.id}
              className={`border rounded-xl p-5 flex flex-col transition-shadow hover:shadow-md ${
                mod.installed ? "border-teal-200 bg-teal-50/30 dark:bg-teal-950/10" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-teal-600" />
                </div>
                {mod.installed && (
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-[10px]">Instalado</Badge>
                )}
              </div>

              <h3 className="font-semibold text-sm">{mod.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex-1">{mod.description}</p>

              <ul className="mt-3 space-y-1">
                {mod.features.map((f) => (
                  <li key={f} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-teal-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-bold">
                  {mod.price === 0 ? "Grátis" : `R$ ${mod.price}/mês`}
                </span>
                {mod.installed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(mod.id, "uninstall")}
                    disabled={isLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
                    Remover
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAction(mod.id, "install")}
                    disabled={isLoading}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                    Instalar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">Nenhum módulo encontrado</p>
        </div>
      )}
    </div>
  );
}
