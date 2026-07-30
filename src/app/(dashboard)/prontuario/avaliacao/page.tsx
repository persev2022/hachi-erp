"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

export default function AvaliacaoPage() {
  const { show } = useToast();
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const [selectedPaciente, setSelectedPaciente] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [score, setScore] = React.useState<number | null>(null);

  // Form state
  const [form, setForm] = React.useState({
    semanaInicio: new Date().toISOString().split("T")[0],
    semanaFim: new Date().toISOString().split("T")[0],
    conscienciaEmocional: "",
    conscienciaObs: "",
    conscienciaSatisfacao: "",
    reatividade: "",
    reatividadeObs: "",
    reatividadeSatisfacao: "",
    participacao: "",
    participacaoObs: "",
    participacaoSatisfacao: "",
    cumprimentoRotina: "",
    cumprimentoObs: "",
    cumprimentoSatisfacao: "",
    vinculoCentro: "",
    vinculoSatisfacao: "",
    riscosAbstinencia: [] as string[],
    nivelRisco: "",
    intervencoes: [] as string[],
    intervencaoDescricao: "",
    intervencaoSatisfacao: "",
    focoProximaSemana: [] as string[],
    focoSatisfacao: "",
  });

  React.useEffect(() => {
    fetch("/api/pacientes?pageSize=100&status=ATIVO")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPacientes(d.data.map((p: any) => ({ id: p.id, nome: p.nome }))); })
      .catch(() => {});
  }, []);

  const handleCheckbox = (field: "riscosAbstinencia" | "intervencoes" | "focoProximaSemana", value: string) => {
    setForm((prev) => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const handleSubmit = async () => {
    if (!selectedPaciente) { show("Selecione um acolhido", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: selectedPaciente,
          tipo: "INDIVIDUAL",
          semanaInicio: form.semanaInicio,
          semanaFim: form.semanaFim,
          dados: form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScore(data.data.score);
        show("Avaliação registrada com sucesso!", "success");
      } else {
        show(data.error || "Erro ao salvar", "error");
      }
    } catch { show("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  const RadioGroup = ({ label, field, options }: { label: string; field: string; options: { value: string; label: string }[] }) => (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition ${(form as any)[field] === opt.value ? "bg-teal-50 border-teal-300 text-teal-700" : "hover:bg-muted"}`}>
            <input type="radio" name={field} value={opt.value} checked={(form as any)[field] === opt.value} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} className="sr-only" />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );

  const SatisfacaoRadio = ({ field }: { field: string }) => (
    <div className="flex gap-2 mt-2">
      {[{ v: "SATISFEITA", l: "✅ Satisfeita", c: "bg-emerald-50 border-emerald-200 text-emerald-700" }, { v: "EM_OBSERVACAO", l: "⚠️ Em observação", c: "bg-amber-50 border-amber-200 text-amber-700" }, { v: "REFORCO", l: "🔴 Reforço", c: "bg-red-50 border-red-200 text-red-700" }].map((opt) => (
        <label key={opt.v} className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] cursor-pointer ${(form as any)[field] === opt.v ? opt.c : "hover:bg-muted"}`}>
          <input type="radio" name={field} value={opt.v} checked={(form as any)[field] === opt.v} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} className="sr-only" />
          {opt.l}
        </label>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/prontuario"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Avaliação Multidisciplinar</h1>
          <p className="text-sm text-muted-foreground">Ficha semanal do acolhido</p>
        </div>
      </div>

      {/* Score result */}
      {score !== null && (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-teal-600" />
              <div>
                <p className="font-semibold text-teal-800">Avaliação registrada!</p>
                <p className="text-sm text-teal-600">Score calculado automaticamente</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-teal-700">{score}/100</div>
          </CardContent>
        </Card>
      )}

      {/* Identification */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium">Acolhido *</label>
            <select value={selectedPaciente} onChange={(e) => setSelectedPaciente(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Semana</label>
            <input type="date" value={form.semanaInicio} onChange={(e) => setForm((p) => ({ ...p, semanaInicio: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* 1. Consciência Emocional */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">1️⃣ Consciência Emocional</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup label="O acolhido reconhece o que sente?" field="conscienciaEmocional" options={[{ value: "BAIXA", label: "Baixa – não identifica" }, { value: "MEDIA", label: "Média – reconhece às vezes" }, { value: "BOA", label: "Boa – nomeia com clareza" }]} />
          <textarea placeholder="Observações..." value={form.conscienciaObs} onChange={(e) => setForm((p) => ({ ...p, conscienciaObs: e.target.value }))} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[60px]" />
          <SatisfacaoRadio field="conscienciaSatisfacao" />
        </CardContent>
      </Card>

      {/* 2. Reatividade */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">2️⃣ Reatividade / Impulsividade</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup label="Como reage diante de frustração?" field="reatividade" options={[{ value: "VERMELHO", label: "🔴 Em crise – reage sem pensar" }, { value: "AMARELO", label: "🟡 Atenção – paciência curta" }, { value: "VERDE", label: "🟢 Estável – consegue lidar" }]} />
          <textarea placeholder="Observações..." value={form.reatividadeObs} onChange={(e) => setForm((p) => ({ ...p, reatividadeObs: e.target.value }))} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[60px]" />
          <SatisfacaoRadio field="reatividadeSatisfacao" />
        </CardContent>
      </Card>

      {/* 3. Participação */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">3️⃣ Participação nas Atividades</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup label="Envolvimento nas reuniões e dinâmicas" field="participacao" options={[{ value: "PASSIVA", label: "Passiva – presente mas fechado" }, { value: "REGULAR", label: "Regular – participa quando estimulado" }, { value: "ATIVA", label: "Ativa – participa espontaneamente" }]} />
          <textarea placeholder="Observações..." value={form.participacaoObs} onChange={(e) => setForm((p) => ({ ...p, participacaoObs: e.target.value }))} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[60px]" />
          <SatisfacaoRadio field="participacaoSatisfacao" />
        </CardContent>
      </Card>

      {/* 4. Cumprimento de Rotina */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">4️⃣ Cumprimento de Rotina e Regras</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup label="Postura no dia a dia" field="cumprimentoRotina" options={[{ value: "FRACO", label: "Fraco – resistência frequente" }, { value: "REGULAR", label: "Regular – oscila" }, { value: "BOM", label: "Bom – coopera e respeita" }]} />
          <textarea placeholder="Observações..." value={form.cumprimentoObs} onChange={(e) => setForm((p) => ({ ...p, cumprimentoObs: e.target.value }))} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[60px]" />
          <SatisfacaoRadio field="cumprimentoSatisfacao" />
        </CardContent>
      </Card>

      {/* 5. Vínculo */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">5️⃣ Vínculo com o Centro</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup label="Sentimento de pertencimento" field="vinculoCentro" options={[{ value: "INSTAVEL", label: "Instável – fala em sair / isola" }, { value: "EM_CONSTRUCAO", label: "Em construção – oscila" }, { value: "ESTAVEL", label: "Estável – demonstra compromisso" }]} />
          <SatisfacaoRadio field="vinculoSatisfacao" />
        </CardContent>
      </Card>

      {/* 6. Risco Abstinência */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">6️⃣ Avaliação de Risco – Abstinência</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Marque os sinais observados:</p>
          <div className="grid grid-cols-2 gap-2">
            {["Isolamento", "Irritabilidade", "Desmotivação/tristeza", "Falas de desistência", "Idealização do uso", "Ansiedade", "Dificuldade de dormir", "Comportamento agressivo", "Desleixo/baixa higiene", "Nenhum sinal relevante"].map((item) => (
              <label key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${form.riscosAbstinencia.includes(item) ? "bg-red-50 border-red-200 text-red-700" : "hover:bg-muted"}`}>
                <input type="checkbox" checked={form.riscosAbstinencia.includes(item)} onChange={() => handleCheckbox("riscosAbstinencia", item)} className="rounded" />
                {item}
              </label>
            ))}
          </div>
          <RadioGroup label="Nível de risco:" field="nivelRisco" options={[{ value: "ESTAVEL", label: "🟢 Estável" }, { value: "ATENCAO", label: "🟡 Atenção" }, { value: "EM_CRISE", label: "🔴 Em crise" }]} />
        </CardContent>
      </Card>

      {/* 7. Intervenção */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">7️⃣ Intervenção Realizada</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {["Conversa individual", "Reforço positivo", "Acompanhamento próximo", "Encaminhamento"].map((item) => (
              <label key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${form.intervencoes.includes(item) ? "bg-teal-50 border-teal-200 text-teal-700" : "hover:bg-muted"}`}>
                <input type="checkbox" checked={form.intervencoes.includes(item)} onChange={() => handleCheckbox("intervencoes", item)} className="rounded" />
                {item}
              </label>
            ))}
          </div>
          <textarea placeholder="Descrição da intervenção..." value={form.intervencaoDescricao} onChange={(e) => setForm((p) => ({ ...p, intervencaoDescricao: e.target.value }))} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-[60px]" />
          <SatisfacaoRadio field="intervencaoSatisfacao" />
        </CardContent>
      </Card>

      {/* 8. Foco Próxima Semana */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">8️⃣ Foco para a Próxima Semana</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {["Encaminhamento Psiquiatra", "Encaminhamento Psicólogo", "Encaminhamento Enfermagem", "Encaminhamento Dentista", "Encaminhamento Terapeuta"].map((item) => (
              <label key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${form.focoProximaSemana.includes(item) ? "bg-blue-50 border-blue-200 text-blue-700" : "hover:bg-muted"}`}>
                <input type="checkbox" checked={form.focoProximaSemana.includes(item)} onChange={() => handleCheckbox("focoProximaSemana", item)} className="rounded" />
                {item}
              </label>
            ))}
          </div>
          <SatisfacaoRadio field="focoSatisfacao" />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 pb-8">
        <Button variant="outline" asChild><Link href="/prontuario">Cancelar</Link></Button>
        <Button onClick={handleSubmit} disabled={submitting || !selectedPaciente} size="lg">
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          Registrar Avaliação
        </Button>
      </div>
    </div>
  );
}
