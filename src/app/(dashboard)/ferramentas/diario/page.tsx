"use client";

import * as React from "react";
import { ClipboardList, Check, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-simple";

interface AlunoPresenca {
  alunoId: string;
  alunoNome: string;
  presente: boolean | null;
}

export default function DiarioPage() {
  const { show } = useToast();
  const [turma, setTurma] = React.useState("5A");
  const [data, setData] = React.useState(new Date().toISOString().split("T")[0]);
  const [registros, setRegistros] = React.useState<AlunoPresenca[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [salvo, setSalvo] = React.useState(false);
  const [observacoes, setObservacoes] = React.useState("");

  const fetchDiario = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/education/diario?turma=${turma}&data=${data}`);
      const d = await res.json();
      if (d.success) {
        setRegistros(d.data.registros || []);
        setSalvo(d.data.salvo || false);
      }
    } catch { show("Erro ao carregar", "error"); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchDiario(); }, [turma, data]);

  const togglePresenca = (alunoId: string, presente: boolean) => {
    setRegistros((prev) =>
      prev.map((r) => r.alunoId === alunoId ? { ...r, presente } : r)
    );
    setSalvo(false);
  };

  const marcarTodos = (presente: boolean) => {
    setRegistros((prev) => prev.map((r) => ({ ...r, presente })));
    setSalvo(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/education/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turma, data, registros, observacoes }),
      });
      const d = await res.json();
      if (d.success) {
        show(`Salvo! ${d.data.presentes} presentes, ${d.data.ausentes} ausentes.`, "success");
        setSalvo(true);
      } else { show(d.error, "error"); }
    } catch { show("Erro ao salvar", "error"); }
    finally { setSaving(false); }
  };

  const presentes = registros.filter((r) => r.presente === true).length;
  const ausentes = registros.filter((r) => r.presente === false).length;
  const pendentes = registros.filter((r) => r.presente === null).length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-teal-600" />
        <h1 className="text-xl font-bold">Diário de Classe</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Registre a frequência dos alunos por turma e data. O sistema calcula automaticamente a porcentagem de presença.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Turma</label>
          <Input value={turma} onChange={(e) => setTurma(e.target.value)} placeholder="5A" className="w-24" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Data</label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-40" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => marcarTodos(true)}>
            <Check className="h-3 w-3 mr-1 text-green-600" /> Todos presentes
          </Button>
          <Button variant="outline" size="sm" onClick={() => marcarTodos(false)}>
            <X className="h-3 w-3 mr-1 text-red-600" /> Todos ausentes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-green-600 font-medium">{presentes} presentes</span>
        <span className="text-red-600 font-medium">{ausentes} ausentes</span>
        {pendentes > 0 && <span className="text-amber-600 font-medium">{pendentes} pendentes</span>}
        {salvo && <span className="text-teal-600 font-medium flex items-center gap-1"><Check className="h-3 w-3" /> Salvo</span>}
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : registros.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum aluno encontrado para esta turma.</p>
          <p className="text-xs mt-1">Cadastre alunos via Matrículas primeiro.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden divide-y">
          {registros.map((r, i) => (
            <div key={r.alunoId} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                <span className="text-sm font-medium">{r.alunoNome}</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => togglePresenca(r.alunoId, true)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${
                    r.presente === true ? "bg-green-100 text-green-700 ring-2 ring-green-300" : "bg-gray-100 text-gray-400 hover:bg-green-50"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => togglePresenca(r.alunoId, false)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${
                    r.presente === false ? "bg-red-100 text-red-700 ring-2 ring-red-300" : "bg-gray-100 text-gray-400 hover:bg-red-50"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Observations + Save */}
      {registros.length > 0 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Observações (opcional)</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 resize-none h-20"
              placeholder="Atividades do dia, ocorrências..."
            />
          </div>
          <Button onClick={handleSave} disabled={saving || pendentes > 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Frequência
          </Button>
          {pendentes > 0 && <p className="text-xs text-amber-600">Marque todos os alunos antes de salvar.</p>}
        </div>
      )}
    </div>
  );
}
