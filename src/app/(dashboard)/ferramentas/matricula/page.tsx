"use client";

import * as React from "react";
import { GraduationCap, Plus, Loader2, Check, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-simple";
import { Badge } from "@/components/ui/badge";

interface Matricula {
  id: string;
  alunoNome: string;
  turma: string;
  serie: string;
  periodo: string;
  status: string;
  responsavel: string;
  createdAt: string;
}

const DOCUMENTOS_NECESSARIOS = [
  "RG/Certidão de nascimento",
  "Comprovante de residência",
  "Histórico escolar",
  "Foto 3x4",
  "Carteira de vacinação",
];

export default function MatriculaPage() {
  const { show } = useToast();
  const [matriculas, setMatriculas] = React.useState<Matricula[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    alunoNome: "",
    turma: "",
    serie: "",
    periodo: "2026",
    responsavel: "",
    responsavelTel: "",
    documentosEntregues: [] as string[],
  });

  React.useEffect(() => {
    fetch("/api/education/matricula")
      .then((r) => r.json())
      .then((d) => { if (d.success) setMatriculas(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.alunoNome || !form.turma) { show("Preencha nome e turma", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/education/matricula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        show("Matrícula realizada com sucesso!", "success");
        setMatriculas((prev) => [{ ...data.data, serie: form.serie, periodo: form.periodo, responsavel: form.responsavel, createdAt: new Date().toISOString() }, ...prev]);
        setShowForm(false);
        setForm({ alunoNome: "", turma: "", serie: "", periodo: "2026", responsavel: "", responsavelTel: "", documentosEntregues: [] });
      } else { show(data.error, "error"); }
    } catch { show("Erro de conexão", "error"); }
    finally { setSaving(false); }
  };

  const toggleDoc = (doc: string) => {
    setForm((prev) => ({
      ...prev,
      documentosEntregues: prev.documentosEntregues.includes(doc)
        ? prev.documentosEntregues.filter((d) => d !== doc)
        : [...prev.documentosEntregues, doc],
    }));
  };

  const statusColor: Record<string, string> = {
    confirmada: "bg-green-100 text-green-700",
    pendente: "bg-amber-100 text-amber-700",
    cancelada: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-teal-600" />
          <h1 className="text-xl font-bold">Matrículas</h1>
          <Badge variant="outline" className="text-xs">{matriculas.length} registros</Badge>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Matrícula
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Dados da Matrícula</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Aluno*</label>
              <Input value={form.alunoNome} onChange={(e) => setForm({ ...form, alunoNome: e.target.value })} placeholder="Nome completo" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Turma*</label>
              <Input value={form.turma} onChange={(e) => setForm({ ...form, turma: e.target.value })} placeholder="Ex: 5A, 3B" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Série</label>
              <Input value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value })} placeholder="Ex: 5o ano" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Período letivo</label>
              <Input value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} placeholder="2026" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Responsável</label>
              <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Nome do responsável" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Telefone responsável</label>
              <Input value={form.responsavelTel} onChange={(e) => setForm({ ...form, responsavelTel: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>

          {/* Checklist documentos */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Documentos entregues</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DOCUMENTOS_NECESSARIOS.map((doc) => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => toggleDoc(doc)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition ${
                    form.documentosEntregues.includes(doc) ? "bg-teal-50 border-teal-300 text-teal-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {form.documentosEntregues.includes(doc) ? <Check className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5 opacity-40" />}
                  {doc}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar Matrícula
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : matriculas.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma matrícula registrada.</p>
          <p className="text-xs mt-1">Clique em "Nova Matrícula" para começar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matriculas.map((m) => (
            <div key={m.id} className="bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{m.alunoNome}</p>
                <p className="text-xs text-muted-foreground">Turma {m.turma} {m.serie && `· ${m.serie}`} · {m.periodo}</p>
                {m.responsavel && <p className="text-xs text-muted-foreground">Resp: {m.responsavel}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[m.status] || "bg-gray-100 text-gray-600"}`}>
                  {m.status}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
