"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Loader2, MessageSquare, QrCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface IntegrationStatus {
  botconversa: { configured: boolean };
  pix: { configured: boolean };
  nfe: { configured: boolean };
}

const integrations = [
  {
    key: "botconversa" as const,
    title: "BotConversa",
    description: "Integração com WhatsApp para envio de mensagens e fluxos automatizados",
    icon: MessageSquare,
    href: "/configuracoes/integracoes/botconversa",
    fields: ["API Key"],
  },
  {
    key: "pix" as const,
    title: "Pix (Sicredi)",
    description: "Cobranças instantâneas via Pix com geração de QR Code",
    icon: QrCode,
    href: "/configuracoes/integracoes/pix",
    fields: ["Client ID", "Client Secret", "Certificado", "Chave Pix"],
  },
  {
    key: "nfe" as const,
    title: "NFS-e Nacional",
    description: "Emissão de notas fiscais via portal nacional ou intermediador",
    icon: FileText,
    href: "/configuracoes/integracoes/nfe",
    fields: ["API Key", "Company ID"],
  },
];

// e-SUS is separate (no API integration — manual process)
const esusCard = {
  title: "e-SUS / SISAB",
  description: "Envio de dados ao SUS via RAAS (processo manual com guia)",
  href: "/configuracoes/esus",
};

export default function IntegracoesPage() {
  const { show } = useToast();
  const [status, setStatus] = React.useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/configuracoes/integracoes");
      if (!res.ok) throw new Error("Erro ao carregar status");
      const data = await res.json();
      setStatus({
        botconversa: { configured: data.botconversa?.configured || false },
        pix: { configured: data.pix?.configured || false },
        nfe: { configured: data.nfe?.configured || false },
      });
    } catch {
      show("Erro ao carregar status das integrações", "error");
    } finally {
      setLoading(false);
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
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Integrações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as credenciais de acesso para cada integração externa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const isConfigured = status?.[integration.key]?.configured || false;
          const Icon = integration.icon;

          return (
            <Card key={integration.key} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isConfigured
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                    }
                  >
                    {isConfigured ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" /> Configurado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <X className="h-3 w-3" /> Pendente
                      </span>
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{integration.title}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-xs text-muted-foreground">
                  Campos: {integration.fields.join(", ")}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={integration.href}>Configurar</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {/* e-SUS card (separate — no API) */}
        <Card className="flex flex-col border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                Manual
              </Badge>
            </div>
            <CardTitle className="text-lg mt-3">{esusCard.title}</CardTitle>
            <CardDescription>{esusCard.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-xs text-muted-foreground">
              Sem integração via API — guia passo a passo para envio manual
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={esusCard.href}>Ver Guia</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
