"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";

export default function PixConfigPage() {
  const { show } = useToast();
  const [clientId, setClientId] = React.useState("");
  const [clientSecret, setClientSecret] = React.useState("");
  const [pixKey, setPixKey] = React.useState("");
  const [certificateBase64, setCertificateBase64] = React.useState("");
  const [environment, setEnvironment] = React.useState<"sandbox" | "production">("sandbox");
  const [showSecret, setShowSecret] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [configured, setConfigured] = React.useState(false);
  const [maskedData, setMaskedData] = React.useState<Record<string, string>>({});
  const [certFileName, setCertFileName] = React.useState("");

  React.useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/configuracoes/integracoes");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setConfigured(data.pix?.configured || false);
      setEnvironment(data.pix?.environment || "sandbox");
      setMaskedData({
        clientId: data.pix?.clientId || "",
        clientSecret: data.pix?.clientSecret || "",
        pixKey: data.pix?.pixKey || "",
        certificateBase64: data.pix?.certificateBase64 || "",
      });
    } catch {
      show("Erro ao carregar configurações", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setCertificateBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!clientId && !configured) {
      show("Informe ao menos o Client ID e Client Secret", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = { environment };
      if (clientId.trim()) payload.clientId = clientId;
      if (clientSecret.trim()) payload.clientSecret = clientSecret;
      if (pixKey.trim()) payload.pixKey = pixKey;
      if (certificateBase64) payload.certificateBase64 = certificateBase64;

      const res = await fetch("/api/configuracoes/integracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration: "pix", data: payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }

      show("Configurações Pix salvas com sucesso!", "success");
      setConfigured(true);
      // Reset fields
      setClientId("");
      setClientSecret("");
      setPixKey("");
      setCertificateBase64("");
      setCertFileName("");
      loadSettings();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      show(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!configured && !clientId) {
      show("Salve as credenciais antes de testar", "warning");
      return;
    }

    setTesting(true);
    try {
      const res = await fetch("/api/integracoes/pix/test", { method: "POST" });
      if (res.ok) {
        show("Conexão com EFI/Pix OK!", "success");
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
          <h1 className="text-2xl font-bold">Pix (Sicredi)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurar integração de cobranças Pix via Sicredi
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
          <CardTitle className="text-lg">Credenciais Sicredi</CardTitle>
          <CardDescription>
            Configure as credenciais de acesso à API Pix do Sicredi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current masked values */}
          {configured && (
            <div className="space-y-1 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p>Client ID: <code>{maskedData.clientId}</code></p>
              <p>Client Secret: <code>{maskedData.clientSecret}</code></p>
              <p>Chave Pix: <code>{maskedData.pixKey}</code></p>
              <p>Certificado: <code>{maskedData.certificateBase64 || "Não enviado"}</code></p>
            </div>
          )}

          {/* Client ID */}
          <div className="space-y-2">
            <label htmlFor="clientId" className="text-sm font-medium">
              Client ID
            </label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder={configured ? "Digite novo para atualizar" : "Client_Id_xxxxxxxxxxxxx"}
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <label htmlFor="clientSecret" className="text-sm font-medium">
              Client Secret
            </label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={configured ? "Digite novo para atualizar" : "Client_Secret_xxxxxxxxxxxxx"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Chave Pix */}
          <div className="space-y-2">
            <label htmlFor="pixKey" className="text-sm font-medium">
              Chave Pix
            </label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
            />
          </div>

          {/* Certificado */}
          <div className="space-y-2">
            <label htmlFor="certificate" className="text-sm font-medium">
              Certificado .p12 <span className="text-muted-foreground font-normal">(opcional no sandbox)</span>
            </label>
            <div className="flex items-center gap-3">
              <Input
                id="certificate"
                type="file"
                accept=".p12,.pem"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border file:border-input file:text-sm file:font-medium file:bg-background hover:file:bg-accent"
              />
              {certFileName && (
                <span className="text-xs text-muted-foreground shrink-0">{certFileName}</span>
              )}
            </div>
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
            <li>Acesse o portal <strong>developer.sicredi.com.br</strong> e crie uma conta</li>
            <li>Navegue até o <strong>Catálogo de APIs</strong> e selecione a API Pix</li>
            <li>Crie uma aplicação e obtenha <strong>Client ID</strong> e <strong>Client Secret</strong></li>
            <li>Cadastre sua <strong>Chave Pix</strong> na conta Sicredi (CPF, CNPJ, email ou aleatória)</li>
            <li>Para <strong>Sandbox</strong>: o certificado é opcional — teste apenas com Client ID + Secret</li>
            <li>Para <strong>Produção</strong>: solicite o certificado .p12 ao seu <strong>gerente de conta PJ</strong> na cooperativa Sicredi (Internet Banking → Pix → Configurações → API)</li>
          </ol>
          <p className="mt-4 p-3 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200 rounded-md border border-blue-200">
            ℹ️ O <strong>certificado mTLS (.p12)</strong> é gerado pela cooperativa Sicredi, não pelo portal de desenvolvedores. Contate seu gerente PJ para solicitar.
          </p>
          <p className="mt-2 p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200 rounded-md border border-amber-200">
            ⚠️ Use o ambiente <strong>Sandbox</strong> para testes (funciona sem certificado). Mude para <strong>Produção</strong> apenas após receber o certificado .p12 da cooperativa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
