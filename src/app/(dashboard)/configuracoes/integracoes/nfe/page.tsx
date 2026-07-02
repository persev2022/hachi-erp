"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";

export default function NfeConfigPage() {
  const { show } = useToast();
  const [apiKey, setApiKey] = React.useState("");
  const [companyId, setCompanyId] = React.useState("");
  const [environment, setEnvironment] = React.useState<"sandbox" | "production">("sandbox");
  const [showKey, setShowKey] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [configured, setConfigured] = React.useState(false);
  const [maskedData, setMaskedData] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/configuracoes/integracoes");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setConfigured(data.nfe?.configured || false);
      setEnvironment(data.nfe?.environment || "sandbox");
      setMaskedData({
        apiKey: data.nfe?.apiKey || "",
        companyId: data.nfe?.companyId || "",
      });
    } catch {
      show("Erro ao carregar configurações", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!apiKey && !companyId && !configured) {
      show("Informe a API Key e o Company ID", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = { environment };
      if (apiKey.trim()) payload.apiKey = apiKey;
      if (companyId.trim()) payload.companyId = companyId;

      const res = await fetch("/api/configuracoes/integracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration: "nfe", data: payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }

      show("Configurações NF-e salvas com sucesso!", "success");
      setConfigured(true);
      setApiKey("");
      setCompanyId("");
      loadSettings();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      show(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!configured && !apiKey) {
      show("Salve as credenciais antes de testar", "warning");
      return;
    }

    setTesting(true);
    try {
      const res = await fetch("/api/integracoes/nfe/test", { method: "POST" });
      if (res.ok) {
        show("Conexão com nfe.io OK!", "success");
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
          <h1 className="text-2xl font-bold">NF-e (nfe.io)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurar emissão de notas fiscais de serviço
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
          <CardTitle className="text-lg">Credenciais nfe.io</CardTitle>
          <CardDescription>
            Configure as credenciais de acesso à API do nfe.io para emissão de NFS-e.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current masked values */}
          {configured && (
            <div className="space-y-1 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p>API Key: <code>{maskedData.apiKey}</code></p>
              <p>Company ID: <code>{maskedData.companyId}</code></p>
            </div>
          )}

          {/* API Key */}
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
                placeholder={configured ? "Digite nova para atualizar" : "Sua API Key do nfe.io"}
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

          {/* Company ID */}
          <div className="space-y-2">
            <label htmlFor="companyId" className="text-sm font-medium">
              Company ID
            </label>
            <Input
              id="companyId"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder={configured ? "Digite novo para atualizar" : "ID da empresa no nfe.io"}
            />
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ambiente</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEnvironment("sandbox")}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  environment === "sandbox"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input hover:bg-accent"
                }`}
              >
                Sandbox (Testes)
              </button>
              <button
                type="button"
                onClick={() => setEnvironment("production")}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  environment === "production"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input hover:bg-accent"
                }`}
              >
                Produção
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como obter as credenciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>Crie uma conta em <strong>app.nfe.io</strong></li>
            <li>Cadastre sua empresa com CNPJ e dados fiscais</li>
            <li>Aguarde a aprovação do cadastro pela prefeitura</li>
            <li>No painel, acesse <strong>Configurações → API</strong></li>
            <li>Gere uma <strong>API Key</strong> e copie</li>
            <li>Copie o <strong>Company ID</strong> da URL do painel (ex: /companies/<strong>abc123</strong>)</li>
            <li>Configure o código de serviço conforme o município</li>
          </ol>
          <p className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
            ⚠️ Use o ambiente <strong>Sandbox</strong> para testes. Notas emitidas em produção são
            reais e possuem validade fiscal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
