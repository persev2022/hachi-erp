"use client";

import * as React from "react";
import { Link2, Copy, Check, Loader2, FileSignature, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-simple";
import { Badge } from "@/components/ui/badge";

interface FormLink {
  token: string;
  tipo: string;
  status: string;
  criadoEm: string;
  dados: any;
  assinatura: any;
}

const TIPO_LABELS: Record<string, string> = {
  "reserva-vaga": "Reserva de Vaga / Pré-Cadastro",
  "transporte-assistido": "OS — Transporte Assistido",
};

export default function FormulariosPage() {
  const { show } = useToast();
  const [links, setLinks] = React.useState<FormLink[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/formularios/gerar-link")
      .then((r) => r.json())
      .then((d) => { if (d.success) setLinks(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const gerarLink = async (tipo: string) => {
    setGenerating(tipo);
    try {
      const res = await fetch("/api/formularios/gerar-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      const data = await res.json();
      if (data.success) {
        navigator.clipboard.writeText(data.data.link);
        show(`Link gerado e copiado! Envie ao cliente.`, "success");
        setLinks((prev) => [{ token: data.data.token, tipo, status: "pendente", criadoEm: new Date().toISOString(), dados: null, assinatura: null }, ...prev]);
      } else {
        show(data.error, "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setGenerating(null); }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/f/${token}`;
    navigator.clipboard.writeText(url);
    show("Link copiado!", "success");
  };

  const statusStyle: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-700",
    preenchido: "bg-blue-100 text-blue-700",
    assinado: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="h-5 w-5 text-teal-600" />
          <h1 className="text-xl font-bold">Formulários Online</h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Gere links de formulários para enviar ao cliente. Após preenchido e assinado, o documento fica disponível aqui para download.
      </p>

      {/* Generate buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => gerarLink("reserva-vaga")}
          disabled={generating === "reserva-vaga"}
          className="bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-xl p-5 text-left transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Link2 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Reserva de Vaga</p>
              <p className="text-xs text-muted-foreground">Pré-cadastro + dados do responsável e paciente</p>
            </div>
          </div>
          {generating === "reserva-vaga" && <Loader2 className="h-4 w-4 animate-spin mt-2 text-teal-600" />}
        </button>

        <button
          onClick={() => gerarLink("transporte-assistido")}
          disabled={generating === "transporte-assistido"}
          className="bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-xl p-5 text-left transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Link2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Transporte Assistido</p>
              <p className="text-xs text-muted-foreground">OS de remoção + dados do transporte</p>
            </div>
          </div>
          {generating === "transporte-assistido" && <Loader2 className="h-4 w-4 animate-spin mt-2 text-indigo-600" />}
        </button>
      </div>

      {/* Links list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileSignature className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum formulário gerado ainda.</p>
          <p className="text-xs mt-1">Clique acima para gerar um link e enviar ao cliente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.token} className="bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{TIPO_LABELS[link.tipo] || link.tipo}</p>
                  <Badge variant="outline" className={`text-[10px] ${statusStyle[link.status] || "bg-gray-100 text-gray-600"}`}>
                    {link.status === "assinado" ? "Assinado" : link.status === "preenchido" ? "Preenchido" : "Pendente"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(link.criadoEm).toLocaleString("pt-BR")}
                  {link.dados?.respNome && ` · ${link.dados.respNome}`}
                  {link.dados?.solNome && ` · ${link.dados.solNome}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => copyLink(link.token)} className="p-2 rounded-lg hover:bg-muted transition" title="Copiar link">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
                <a href={`/f/${link.token}`} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-muted transition" title="Abrir formulário">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                {link.status === "assinado" && (
                  <a
                    href={`/api/formularios/${link.token}/pdf`}
                    target="_blank"
                    rel="noopener"
                    className="p-2 rounded-lg hover:bg-muted transition"
                    title="Baixar PDF assinado"
                  >
                    <Download className="h-4 w-4 text-green-600" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
