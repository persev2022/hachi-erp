"use client";

import * as React from "react";
import {
  FileText,
  Download,
  Plus,
  Loader2,
  X,
  FileSignature,
  Receipt,
  Pill,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

const documentTypes = [
  { id: "CONTRATO", label: "Contrato", icon: FileSignature, desc: "Contrato de prestação de serviços" },
  { id: "RECIBO", label: "Recibo", icon: Receipt, desc: "Recibo de pagamento" },
  { id: "RECEITA_SIMPLES", label: "Receita Simples", icon: Pill, desc: "Receituário simples" },
  { id: "RECEITA_ESPECIAL", label: "Receita Especial", icon: Pill, desc: "Receituário de controle especial" },
  { id: "ATESTADO", label: "Atestado/Declaração", icon: ScrollText, desc: "Atestado médico e declaração" },
];

export default function DocumentosPage() {
  const terms = useTerminology();
  const { show } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome })));
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGenerating(true);

    const form = new FormData(e.currentTarget);
    const payload: any = {
      tipo: selectedType,
      pacienteId: form.get("pacienteId"),
    };

    // Add extra fields based on type
    if (selectedType === "RECIBO") {
      payload.motivo = form.get("motivo") || undefined;
      payload.valor = parseFloat(form.get("valor") as string) || undefined;
      payload.nomePagante = form.get("nomePagante") || undefined;
      payload.cpfPagante = form.get("cpfPagante") || undefined;
    }
    if (selectedType === "RECEITA_ESPECIAL") {
      payload.descricao = form.get("descricao") || undefined;
    }
    if (selectedType === "ATESTADO") {
      payload.dataInicio = form.get("dataInicio") || undefined;
      payload.dataFim = form.get("dataFim") || undefined;
    }

    try {
      const res = await fetch("/api/documentos/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        show(err.error || "Erro ao gerar documento", "error");
        return;
      }

      // Download the file
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match ? match[1] : `documento-${selectedType.toLowerCase()}.docx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      show("Documento gerado com sucesso!", "success");
      setShowForm(false);
    } catch {
      show("Erro de conexão", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gere contratos, recibos, receitas e atestados
          </p>
        </div>
      </div>

      {/* Document type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card
              key={doc.id}
              className="cursor-pointer hover:shadow-md transition"
              onClick={() => { setSelectedType(doc.id); setShowForm(true); }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{doc.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Gerar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generation modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                Gerar {documentTypes.find((d) => d.id === selectedType)?.label}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleGenerate} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{terms.paciente} *</label>
                <select
                  name="pacienteId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{`Selecione o ${terms.paciente.toLowerCase()}`}</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              {/* RECIBO extra fields */}
              {selectedType === "RECIBO" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor (R$)</label>
                      <Input name="valor" type="number" step={0.01} placeholder="Ex: 1500" />
                      <p className="text-xs text-muted-foreground">Deixe vazio para usar matrícula</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Motivo</label>
                      <Input name="motivo" placeholder="Ex: Matrícula" defaultValue="Matrícula" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Pagante</label>
                      <Input name="nomePagante" placeholder="Deixe vazio para responsável" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CPF Pagante</label>
                      <Input name="cpfPagante" placeholder="Deixe vazio para responsável" />
                    </div>
                  </div>
                </>
              )}

              {/* RECEITA ESPECIAL */}
              {selectedType === "RECEITA_ESPECIAL" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição do medicamento</label>
                  <textarea
                    name="descricao"
                    rows={3}
                    placeholder="Ex: Clonazepam 2mg — tomar 1 comprimido à noite"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                  />
                </div>
              )}

              {/* ATESTADO */}
              {selectedType === "ATESTADO" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data início</label>
                    <Input name="dataInicio" type="date" />
                    <p className="text-xs text-muted-foreground">Vazio = admissão</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data fim</label>
                    <Input name="dataFim" type="date" />
                    <p className="text-xs text-muted-foreground">Vazio = alta prevista</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={generating}>
                  {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Download className="h-4 w-4 mr-2" />
                  Gerar e Baixar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
