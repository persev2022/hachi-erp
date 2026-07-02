"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";

export default function BotConversaConfigPage() {
  const { show } = useToast();
  const [apiKey, setApiKey] = React.useState("");
  const [showKey, setShowKey] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [configured, setConfigured] = React.useState(false);
  const [maskedKey, setMaskedKey] = React.useState("");

  React.useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/configuracoes/integracoes");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setConfigured(data.botconversa?.configured || false);
      setMaskedKey(data.botconversa?.apiKey || "");
    } catch {
      show("Erro ao carregar configurações", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      show("Informe a API Key", "warning");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/configuracoes/integracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integration: "botconversa",
          data: { apiKey },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }

      show("Configurações salvas com sucesso!", "success");
      setConfigured(true);
      setMaskedKey(`****...${apiKey.slice(-4)}`);
      setApiKey("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      show(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    const keyToTest = apiKey.trim() || undefined;
    if (!keyToTest && !configured) {
      show("Salve uma API Key antes de testar", "warning");
      return;
    }

    setTesting(true);
    try {
      const res = await fetch("/api/integracoes/botconversa/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      if (res.ok) {
        show("Conexão com BotConversa OK!", "success");
      } else {
        const err = await res.json();
        show(err.error || "Falha na conexão", "error");
      }
    } catch {
      show("Erro ao testar conexão", "error");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes/integracoes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">BotConversa</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurar integração com WhatsApp via BotConversa
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        {configured ? (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Conectado
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <X className="h-4 w-4" /> Desconectado
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Credenciais</CardTitle>
          <CardDescription>
            Insira a API Key do BotConversa. Você pode obtê-la no painel em
            Configurações → API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configured && maskedKey && (
            <div className="text-sm text-muted-foreground">
              Chave atual: <code className="bg-muted px-2 py-0.5 rounded">{maskedKey}</code>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={configured ? "Digite nova chave para atualizar" : "Cole sua API Key aqui"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || !apiKey.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
