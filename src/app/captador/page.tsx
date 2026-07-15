"use client";

import * as React from "react";
import { CheckCircle, Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CaptadorPage() {
  const [step, setStep] = React.useState<"form" | "success">("form");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showWarning, setShowWarning] = React.useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form.entries());

    // Build checkboxes
    const substancias = ["alcool", "cocaina", "crack", "maconha", "medicamentos", "multiplas"].filter((s) => raw[`sub_${s}`]).join(", ");
    const comorbidades = ["depressao", "ansiedade", "bipolar", "esquizofrenia"].filter((s) => raw[`comor_${s}`]).join(", ");
    const doencas = ["diabetes", "hipertensao", "hiv", "hepatite", "cardiopatia"].filter((s) => raw[`doenca_${s}`]).join(", ");

    const dados = {
      pacienteNome: raw.pacienteNome,
      pacienteCpf: raw.pacienteCpf,
      pacienteRg: raw.pacienteRg,
      pacienteNascimento: raw.pacienteNascimento,
      pacienteSexo: raw.pacienteSexo,
      tipoSanguineo: raw.tipoSanguineo,
      pacienteEstadoCivil: raw.pacienteEstadoCivil,
      pacienteProfissao: raw.pacienteProfissao,
      escolaridade: raw.escolaridade,
      pacienteTelefone: raw.pacienteTelefone,
      pacienteEmail: raw.pacienteEmail,
      pacienteEndereco: `${raw.rua || ""}, ${raw.numero || ""} - ${raw.bairro || ""}, ${raw.cidade || ""}/${raw.uf || ""} - CEP ${raw.cep || ""}`,
      substancias: substancias + (raw.substanciasOutras ? `, ${raw.substanciasOutras}` : ""),
      tempoUso: raw.tempoUso,
      frequenciaUso: raw.frequenciaUso,
      ultimoUso: raw.ultimoUso,
      internacoesAnteriores: raw.internacoesAnteriores,
      comorbidades: comorbidades + (raw.comorbidadesOutras ? `, ${raw.comorbidadesOutras}` : ""),
      medicamentos: raw.medicamentos,
      alergias: raw.alergias,
      doencasCronicas: doencas + (raw.doencasOutras ? `, ${raw.doencasOutras}` : ""),
      tentativaSuicidio: raw.tentativaSuicidio,
      comportamentoViolento: raw.comportamentoViolento,
      responsavelNome: raw.responsavelNome,
      responsavelCpf: raw.responsavelCpf,
      responsavelRg: raw.responsavelRg,
      responsavelParentesco: raw.responsavelParentesco,
      responsavelTelefone: raw.responsavelTelefone,
      responsavelEmail: raw.responsavelEmail,
      responsavelEndereco: `${raw.respRua || ""}, ${raw.respNumero || ""} - ${raw.respBairro || ""}, ${raw.respCidade || ""}/${raw.respUf || ""}`,
      tipoInternacao: raw.tipoInternacao,
      quemBusca: raw.quemBusca,
      pacienteSabe: raw.pacienteSabe,
      pacienteConcorda: raw.pacienteConcorda,
      necessitaTranslado: raw.necessitaTranslado,
      dataPretendida: raw.dataPretendida,
      valorMensalidade: raw.valorMensalidade,
      planoTratamento: raw.planoTratamento,
      pertences: raw.pertences,
      restricaoAlimentar: raw.restricaoAlimentar,
      religiao: raw.religiao,
      filhosMenores: raw.filhosMenores,
      beneficioInss: raw.beneficioInss,
      pendenciasJudiciais: raw.pendenciasJudiciais,
      observacoes: raw.observacoes,
      captadorNome: raw.captadorNome,
      captadorCpf: raw.captadorCpf,
      captadorTelefone: raw.captadorTelefone,
      captadorEmail: raw.captadorEmail,
      captadorPix: raw.captadorPix,
    };

    try {
      const res = await fetch("/api/captadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dados }),
      });
      const json = await res.json();
      if (json.success) setStep("success");
      else setError(json.error || "Erro ao enviar");
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md text-center bg-white rounded-2xl shadow-lg p-8">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold">Captação Enviada</h1>
          <p className="text-sm text-gray-500 mt-2">Os dados foram recebidos pela equipe. Entraremos em contato em breve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Questionário de Captação</h1>
          <p className="text-sm text-gray-500 mt-1">Formulário de Admissão — Captadores Externos</p>
          <p className="text-xs text-gray-400 mt-1">Documento confidencial — Uso exclusivo para processo de internação</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning popup */}
          {showWarning && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 relative">
              <button onClick={() => setShowWarning(false)} className="absolute top-3 right-3 p-1 rounded hover:bg-amber-100 transition">
                <X className="h-4 w-4 text-amber-600" />
              </button>
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Atenção</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    A falta do preenchimento de informações descumpre as normas do CT Persev. 
                    Preencha com o máximo de acuracidade possível. Campos incompletos podem 
                    atrasar o processo de admissão.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 1. Dados do Paciente */}
          <Section title="1. Dados do Paciente (Acolhido)">
            <Row2><Field label="Nome completo *" name="pacienteNome" required /><Field label="CPF" name="pacienteCpf" /></Row2>
            <Row2><Field label="RG" name="pacienteRg" /><Field label="Data de nascimento" name="pacienteNascimento" type="date" /></Row2>
            <Row2>
              <div><label className="text-xs font-medium text-gray-600">Sexo</label><select name="pacienteSexo" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Masculino</option><option>Feminino</option></select></div>
              <Field label="Tipo sanguíneo" name="tipoSanguineo" />
            </Row2>
            <div><label className="text-xs font-medium text-gray-600">Estado civil</label><select name="pacienteEstadoCivil" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União Estável</option></select></div>
            <Row2><Field label="Profissão" name="pacienteProfissao" /><Field label="Escolaridade" name="escolaridade" /></Row2>
            <Row2><Field label="Telefone" name="pacienteTelefone" /><Field label="Email" name="pacienteEmail" type="email" /></Row2>
            <Row2><Field label="Rua" name="rua" /><Field label="Número" name="numero" /></Row2>
            <Row2><Field label="Bairro" name="bairro" /><Field label="Cidade" name="cidade" /></Row2>
            <Row2><Field label="UF" name="uf" /><Field label="CEP" name="cep" /></Row2>
          </Section>

          {/* 2. Dados Clínicos */}
          <Section title="2. Dados Clínicos">
            <div><label className="text-xs font-medium text-gray-600 block mb-2">Substância(s) de uso principal:</label>
              <div className="flex flex-wrap gap-3 text-sm">{["alcool|Álcool","cocaina|Cocaína","crack|Crack","maconha|Maconha","medicamentos|Medicamentos","multiplas|Múltiplas"].map((s) => { const [k,v] = s.split("|"); return <label key={k} className="flex items-center gap-1"><input type="checkbox" name={`sub_${k}`} />{v}</label>; })}</div>
              <Input name="substanciasOutras" placeholder="Outras..." className="mt-2" />
            </div>
            <Row2><Field label="Tempo de uso (anos)" name="tempoUso" /></Row2>
            <div><label className="text-xs font-medium text-gray-600">Frequência</label><select name="frequenciaUso" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Diário</option><option>Semanal</option><option>Eventual</option></select></div>
            <Field label="Última vez que usou" name="ultimoUso" />
            <Field label="Internações anteriores (quantas e onde)" name="internacoesAnteriores" />
            <div><label className="text-xs font-medium text-gray-600 block mb-2">Comorbidades psiquiátricas:</label>
              <div className="flex flex-wrap gap-3 text-sm">{["depressao|Depressão","ansiedade|Ansiedade","bipolar|Bipolar","esquizofrenia|Esquizofrenia"].map((s) => { const [k,v] = s.split("|"); return <label key={k} className="flex items-center gap-1"><input type="checkbox" name={`comor_${k}`} />{v}</label>; })}</div>
              <Input name="comorbidadesOutras" placeholder="Outras..." className="mt-2" />
            </div>
            <Field label="Medicamentos em uso (com dosagem)" name="medicamentos" />
            <Row2><Field label="Alergias" name="alergias" /><div /></Row2>
            <div><label className="text-xs font-medium text-gray-600 block mb-2">Doenças crônicas:</label>
              <div className="flex flex-wrap gap-3 text-sm">{["diabetes|Diabetes","hipertensao|Hipertensão","hiv|HIV","hepatite|Hepatite","cardiopatia|Cardiopatia"].map((s) => { const [k,v] = s.split("|"); return <label key={k} className="flex items-center gap-1"><input type="checkbox" name={`doenca_${k}`} />{v}</label>; })}</div>
              <Input name="doencasOutras" placeholder="Outras..." className="mt-2" />
            </div>
            <Row2>
              <div><label className="text-xs font-medium text-gray-600">Tentativa de suicídio?</label><select name="tentativaSuicidio" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Não</option><option>Sim</option></select></div>
              <div><label className="text-xs font-medium text-gray-600">Comportamento violento?</label><select name="comportamentoViolento" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Não</option><option>Sim</option></select></div>
            </Row2>
          </Section>

          {/* 3. Responsável Financeiro */}
          <Section title="3. Dados do Responsável Financeiro">
            <Field label="Nome completo" name="responsavelNome" />
            <Row2><Field label="CPF" name="responsavelCpf" /><Field label="RG" name="responsavelRg" /></Row2>
            <div><label className="text-xs font-medium text-gray-600">Parentesco</label><select name="responsavelParentesco" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Mãe</option><option>Pai</option><option>Irmã(o)</option><option>Filho(a)</option><option>Esposa(o)</option><option>Outro</option></select></div>
            <Row2><Field label="Telefone 1 (WhatsApp)" name="responsavelTelefone" /><Field label="Email" name="responsavelEmail" type="email" /></Row2>
            <Row2><Field label="Rua" name="respRua" /><Field label="Número" name="respNumero" /></Row2>
            <Row2><Field label="Bairro" name="respBairro" /><Field label="Cidade" name="respCidade" /></Row2>
            <Row2><Field label="UF" name="respUf" /><Field label="CEP" name="respCep" /></Row2>
          </Section>

          {/* 4. Informações da Internação */}
          <Section title="4. Informações da Internação">
            <div><label className="text-xs font-medium text-gray-600">Tipo de internação</label><select name="tipoInternacao" className="w-full border rounded-lg px-3 py-2 text-sm"><option value="">Selecione</option><option>Voluntária</option><option>Involuntária</option><option>Compulsória</option><option>Judicial</option></select></div>
            <div><label className="text-xs font-medium text-gray-600">Quem está buscando tratamento?</label><select name="quemBusca" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Próprio paciente</option><option>Família</option><option>Ordem judicial</option></select></div>
            <Row2>
              <div><label className="text-xs font-medium text-gray-600">Paciente sabe?</label><select name="pacienteSabe" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Sim</option><option>Não</option></select></div>
              <div><label className="text-xs font-medium text-gray-600">Paciente concorda?</label><select name="pacienteConcorda" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Sim</option><option>Não</option><option>Parcialmente</option></select></div>
            </Row2>
            <div><label className="text-xs font-medium text-gray-600">Necessita translado?</label><select name="necessitaTranslado" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Não</option><option>Sim</option></select></div>
            <Row2><Field label="Data pretendida" name="dataPretendida" type="date" /><Field label="Valor mensalidade (R$)" name="valorMensalidade" /></Row2>
            <div><label className="text-xs font-medium text-gray-600">Plano de tratamento</label><select name="planoTratamento" className="w-full border rounded-lg px-3 py-2 text-sm"><option>3 meses</option><option>6 meses</option><option>9 meses</option><option>12 meses</option></select></div>
          </Section>

          {/* 5. Complementares */}
          <Section title="5. Informações Complementares">
            <Field label="Pertences a trazer" name="pertences" />
            <Field label="Restrição alimentar" name="restricaoAlimentar" />
            <Field label="Religião" name="religiao" />
            <Field label="Filhos menores (quantos e com quem)" name="filhosMenores" />
            <div><label className="text-xs font-medium text-gray-600">Benefício INSS?</label><select name="beneficioInss" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Não</option><option>Sim</option></select></div>
            <div><label className="text-xs font-medium text-gray-600">Pendências judiciais?</label><select name="pendenciasJudiciais" className="w-full border rounded-lg px-3 py-2 text-sm"><option>Não</option><option>Sim</option></select></div>
            <div><label className="text-xs font-medium text-gray-600">Observações</label><textarea name="observacoes" className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-20" /></div>
          </Section>

          {/* 6. Dados do Captador */}
          <Section title="6. Dados do Captador">
            <Field label="Nome do captador *" name="captadorNome" required />
            <Row2><Field label="CPF" name="captadorCpf" /><Field label="Telefone" name="captadorTelefone" /></Row2>
            <Row2><Field label="Email" name="captadorEmail" type="email" /><Field label="Chave PIX para comissão" name="captadorPix" /></Row2>
          </Section>

          {/* Declaração */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
            <p>&quot;Declaro que as informações acima são verdadeiras e foram obtidas com consentimento do responsável. Estou ciente de que informações falsas ou omissões podem resultar em cancelamento da comissão e responsabilização civil.&quot;</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-base font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enviar Questionário
          </Button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border p-6 space-y-4"><h2 className="font-semibold text-gray-900 border-b pb-2">{title}</h2>{children}</div>;
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, name, type = "text", required = false, ...props }: { label: string; name: string; type?: string; required?: boolean; className?: string }) {
  return <div><label className="text-xs font-medium text-gray-600">{label}</label><Input name={name} type={type} required={required} {...props} /></div>;
}
