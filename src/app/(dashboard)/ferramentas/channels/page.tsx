"use client";

import * as React from "react";
import { Link2, Unlink, RefreshCw, Loader2, Globe, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-simple";

interface Channel {
  id: string;
  name: string;
  status: "active" | "disconnected" | "syncing";
  commission: number;
  lastSync: string | null;
}

export default function ChannelManagerPage() {
  const { show } = useToast();
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [settings, setSettings] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/hotel/channels")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setChannels(d.data.channels || []);
          setSettings(d.data.settings || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (channelId: string, action: "connect" | "disconnect" | "sync") => {
    setActionLoading(channelId);
    try {
      const res = await fetch("/api/hotel/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, channelId }),
      });
      const data = await res.json();
      if (data.success) {
        show(data.message, "success");
        // Refresh
        const refreshRes = await fetch("/api/hotel/channels");
        const refreshData = await refreshRes.json();
        if (refreshData.success) setChannels(refreshData.data.channels || []);
      } else {
        show(data.error, "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setActionLoading(null); }
  };

  const channelColors: Record<string, string> = {
    booking: "bg-blue-600",
    airbnb: "bg-rose-500",
    expedia: "bg-yellow-500",
    decolar: "bg-purple-600",
    direct: "bg-teal-600",
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-teal-600" />
          <h1 className="text-xl font-bold">Channel Manager</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleAction("all", "sync")} disabled={!!actionLoading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${actionLoading ? "animate-spin" : ""}`} />
          Sincronizar tudo
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Conecte canais de venda (OTAs), sincronize tarifas e disponibilidade automaticamente. Proteção contra overbooking inclusa.
      </p>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Zap className="h-3.5 w-3.5" /> Canais ativos
          </div>
          <p className="text-2xl font-bold">{channels.filter((c) => c.status === "active").length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Shield className="h-3.5 w-3.5" /> Proteção overbooking
          </div>
          <p className="text-2xl font-bold text-teal-600">{settings.overbookProtection ? "Ativa" : "Inativa"}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <RefreshCw className="h-3.5 w-3.5" /> Sync automático
          </div>
          <p className="text-2xl font-bold">{settings.autoSync ? `A cada ${settings.syncInterval || 15}min` : "Manual"}</p>
        </div>
      </div>

      {/* Channels list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${channelColors[channel.id] || "bg-gray-500"} flex items-center justify-center`}>
                  <span className="text-white font-bold text-xs">{channel.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{channel.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Comissão: {channel.commission}%</span>
                    {channel.lastSync && (
                      <span>Sync: {new Date(channel.lastSync).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${channel.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {channel.status === "active" ? "Conectado" : "Desconectado"}
                </span>
                {channel.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => handleAction(channel.id, "disconnect")} disabled={actionLoading === channel.id}>
                    {actionLoading === channel.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3 mr-1" />}
                    Desconectar
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleAction(channel.id, "connect")} disabled={actionLoading === channel.id} className="bg-teal-600 hover:bg-teal-700">
                    {actionLoading === channel.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2 className="h-3 w-3 mr-1" />}
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
