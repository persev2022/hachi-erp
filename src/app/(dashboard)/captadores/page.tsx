"use client";

import * as React from "react";
import { Users, Check, X, Download, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

interface Captacao {
  id: string;
  status: string;
  criadoEm: string;
  dados: any;
  pacienteId?: string;
}

export default function CaptadoresPage() {
  const { show } = useToast();
  const [captacoes, setCaptacoes] = React.useState<Captacao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("todos");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/captadores")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCaptacoes(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAceitar = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/captadores/${id}/aceitar`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        show(`Paciente ${data.data.pacienteNome} cadastrado com sucesso!`, "success");
        setCaptacoes((prev) => prev.map((c) => c.id === id ? { ...c, status: "aceito", pacienteId: data.data.pacienteId } : c));
      } else { show(data.error, "error"); }
    } catch { show("Erro de conexão", "error"); }
    finally { setActionLoading(null); }
  };

  // Group by captador name
  const captadores = React.useMemo(() => {
    const map: Record<string, Captacao[]> = {};
    captacoes.forEach((c) => {
      const nome = c.dados?.captadorNome || "Sem captador";
      if (!map[nome]) map[nome] = [];
      map[nome].push(c);
    });
    return map;
  }, [captacoes]);

  const filtered = filter === "todos" ? captacoes :
    captacoes.filter((c) => c.status === filter);

  const statusStyle: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-700",
    aceito: "bg-green-100 text-green-700",
    recusado: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600" />
          <h1 className="text-xl font-bold">Captadores</h1>
          <Badge variant="outline" className="text-xs">{captacoes.length} captações</Badge>
        </div>
        <div className="flex gap-2">
          {["todos", "pendente", "aceito"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-full border transition ${filter === f ? "bg-teal-600 text-white border-teal-600" : "border-gray-200 text-gray-600"}`}>
              {f === "todos" ? "Todos" : f === "pendente" ? "Pendentes" : "Aceitos"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Captações recebidas por captadores externos. Clique em &quot;Aceitar&quot; para cadastrar o paciente automaticamente no sistema.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{captacoes.filter((c) => c.status === "pendente").length}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{captacoes.filter((c) => c.status === "aceito").length}</p>
          <p className="text-xs text-muted-foreground">Aceitos</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{Object.keys(captadores).length}</p>
          <p className="text-xs text-muted-foreground">Captadores</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma captação {filter !== "todos" ? filter : ""} encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{c.dados?.pacienteNome || "—"}</p>
                    <Badge variant="outline" className={`text-[10px] ${statusStyle[c.status] || ""}`}>{c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Captador: <span className="font-medium">{c.dados?.captadorNome || "—"}</span>
                    {" · "}{new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                    {c.dados?.tipoInternacao && ` · ${c.dados.tipoInternacao}`}
                    {c.dados?.valorMensalidade && ` · R$ ${c.dados.valorMensalidade}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="p-2 rounded-lg hover:bg-muted transition" title="Ver detalhes">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <a href={`/api/captadores/${c.id}/pdf`} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-muted transition" title="PDF">
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                  {c.status === "pendente" && (
                    <Button size="sm" onClick={() => handleAceitar(c.id)} disabled={actionLoading === c.id} className="bg-green-600 hover:bg-green-700">
                      {actionLoading === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                      Aceitar
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expanded === c.id && (
                <div className="border-t px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 text-xs space-y-1 max-h-60 overflow-y-auto">
                  <p><span className="text-gray-500">CPF Paciente:</span> {c.dados?.pacienteCpf || "—"}</p>
                  <p><span className="text-gray-500">Nascimento:</span> {c.dados?.pacienteNascimento || "—"}</p>
                  <p><span className="text-gray-500">Substâncias:</span> {c.dados?.substancias || "—"}</p>
                  <p><span className="text-gray-500">Comorbidades:</span> {c.dados?.comorbidades || "—"}</p>
                  <p><span className="text-gray-500">Responsável:</span> {c.dados?.responsavelNome || "—"} ({c.dados?.responsavelParentesco || "—"})</p>
                  <p><span className="text-gray-500">Tel Responsável:</span> {c.dados?.responsavelTelefone || "—"}</p>
                  <p><span className="text-gray-500">Tipo internação:</span> {c.dados?.tipoInternacao || "—"}</p>
                  <p><span className="text-gray-500">Plano:</span> {c.dados?.planoTratamento || "—"}</p>
                  <p><span className="text-gray-500">Data pretendida:</span> {c.dados?.dataPretendida || "—"}</p>
                  <p><span className="text-gray-500">Translado:</span> {c.dados?.necessitaTranslado || "—"}</p>
                  <p><span className="text-gray-500">PIX Captador:</span> {c.dados?.captadorPix || "—"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
