"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FormularioPublicoPage() {
  const { token } = useParams<{ token: string }>();
  const [formInfo, setFormInfo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [signed, setSigned] = React.useState(false);
  const [signResult, setSignResult] = React.useState<any>(null);

  React.useEffect(() => {
    fetch(`/api/formularios/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFormInfo(d.data);
        else setError(d.error);
      })
      .catch(() => setError("Erro ao carregar formulário"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const dados = Object.fromEntries(form.entries());
    const assinaturaNome = dados.assinaturaNome as string;

    if (!assinaturaNome) { setError("Digite seu nome completo para assinar"); setSubmitting(false); return; }

    try {
      const res = await fetch(`/api/formularios/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dados, assinaturaNome }),
      });
      const json = await res.json();
      if (json.success) {
        setSigned(true);
        setSignResult(json.data);
      } else {
        setError(json.error);
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error && !formInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Link inválido ou expirado</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (formInfo?.assinado || signed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-lg p-8">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Documento Assinado</h1>
          <p className="text-sm text-gray-500 mt-2">
            Este formulário já foi preenchido e assinado digitalmente.
          </p>
          {signResult?.hash && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Hash SHA-256</p>
              <p className="text-xs font-mono text-gray-600 break-all mt-1">{signResult.hash}</p>
              <p className="text-[10px] text-gray-400 mt-2">{signResult.assinadoEm}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render form based on type
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {formInfo.tipo === "reserva-vaga" ? "Solicitação de Reserva de Vaga e Pré-Cadastro" : "Ordem de Serviço — Transporte Assistido"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Preencha os dados para solicitar a reserva de vaga e iniciar o pré-cadastro.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formInfo.tipo === "reserva-vaga" ? <ReservaVagaForm /> : <TransporteAssistidoForm />}

          {/* Assinatura */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-teal-600" />
              Assinatura Digital
            </h2>
            <p className="text-xs text-gray-500">
              Ao digitar seu nome completo e clicar em "Assinar", você concorda com as declarações acima e assina digitalmente este documento (SHA-256, conforme Lei 14.063/2020).
            </p>
            <div>
              <label className="text-xs font-medium text-gray-600">Nome completo (assinatura) *</label>
              <Input name="assinaturaNome" required placeholder="Digite seu nome completo para assinar" className="text-base" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Local</label>
              <Input name="local" placeholder="Cidade" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <Button type="submit" disabled={submitting} className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-base font-semibold">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSignature className="h-4 w-4 mr-2" />}
            Assinar e Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ─── Formulário de Reserva de Vaga ─── */
function ReservaVagaForm() {
  return (
    <>
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Dados do Contratante/Responsável</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Nome completo *</label><Input name="respNome" required /></div>
          <div><label className="text-xs font-medium text-gray-600">RG</label><Input name="respRg" /></div>
          <div><label className="text-xs font-medium text-gray-600">CPF *</label><Input name="respCpf" required placeholder="000.000.000-00" /></div>
          <div>
            <label className="text-xs font-medium text-gray-600">Estado civil</label>
            <select name="respEstadoCivil" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Selecione</option><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União Estável</option>
            </select>
          </div>
          <div><label className="text-xs font-medium text-gray-600">Profissão</label><Input name="respProfissao" /></div>
          <div><label className="text-xs font-medium text-gray-600">Telefone 1 *</label><Input name="respTel1" required /></div>
          <div><label className="text-xs font-medium text-gray-600">Telefone 2</label><Input name="respTel2" /></div>
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">E-mail</label><Input name="respEmail" type="email" /></div>
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Endereço completo *</label><Input name="respEndereco" required /></div>
          <div><label className="text-xs font-medium text-gray-600">Bairro</label><Input name="respBairro" /></div>
          <div><label className="text-xs font-medium text-gray-600">Cidade/UF *</label><Input name="respCidade" required /></div>
          <div><label className="text-xs font-medium text-gray-600">CEP</label><Input name="respCep" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Dados do Acolhido/Paciente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Nome completo *</label><Input name="pacNome" required /></div>
          <div><label className="text-xs font-medium text-gray-600">RG</label><Input name="pacRg" /></div>
          <div><label className="text-xs font-medium text-gray-600">CPF *</label><Input name="pacCpf" required /></div>
          <div>
            <label className="text-xs font-medium text-gray-600">Estado civil</label>
            <select name="pacEstadoCivil" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Selecione</option><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option>
            </select>
          </div>
          <div><label className="text-xs font-medium text-gray-600">Profissão</label><Input name="pacProfissao" /></div>
          <div><label className="text-xs font-medium text-gray-600">Data de nascimento *</label><Input name="pacNascimento" type="date" required /></div>
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Endereço</label><Input name="pacEndereco" /></div>
          <div><label className="text-xs font-medium text-gray-600">Cidade/UF</label><Input name="pacCidade" /></div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-2">
        <p><strong>Declaração:</strong> Declaro que as informações são verdadeiras e solicito a reserva de vaga para acolhimento, conforme disponibilidade.</p>
        <p><strong>Importante:</strong> Esta solicitação tem caráter de pré-cadastro e reserva, não configura execução do serviço.</p>
        <p><strong>Autorização:</strong> Autorizo a equipe a entrar em contato para continuidade do atendimento.</p>
      </div>
    </>
  );
}

/* ─── Formulário de Transporte Assistido ─── */
function TransporteAssistidoForm() {
  return (
    <>
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Seção 1 — Dados da OS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-xs font-medium text-gray-600">Data *</label><Input name="osData" type="date" required defaultValue={new Date().toISOString().split("T")[0]} /></div>
          <div><label className="text-xs font-medium text-gray-600">Hora *</label><Input name="osHora" type="time" required /></div>
          <div><label className="text-xs font-medium text-gray-600">Responsável pela abertura</label><Input name="osResponsavel" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Seção 2 — Solicitante / Responsável Legal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Nome *</label><Input name="solNome" required /></div>
          <div><label className="text-xs font-medium text-gray-600">CPF *</label><Input name="solCpf" required /></div>
          <div><label className="text-xs font-medium text-gray-600">RG</label><Input name="solRg" /></div>
          <div><label className="text-xs font-medium text-gray-600">Parentesco</label><Input name="solParentesco" /></div>
          <div><label className="text-xs font-medium text-gray-600">Telefone *</label><Input name="solTelefone" required /></div>
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Endereço</label><Input name="solEndereco" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Seção 3 — Dados do Paciente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Nome *</label><Input name="pacNome" required /></div>
          <div><label className="text-xs font-medium text-gray-600">CPF</label><Input name="pacCpf" /></div>
          <div><label className="text-xs font-medium text-gray-600">RG</label><Input name="pacRg" /></div>
          <div><label className="text-xs font-medium text-gray-600">Data de nascimento</label><Input name="pacNasc" type="date" /></div>
          <div><label className="text-xs font-medium text-gray-600">Idade</label><Input name="pacIdade" type="number" /></div>
          <div className="md:col-span-2"><label className="text-xs font-medium text-gray-600">Endereço de coleta *</label><Input name="pacEnderecoColeta" required /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Seção 4 — Tipo de Atendimento</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Modalidade *</label>
            <select name="modalidade" required className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Selecione</option><option value="Voluntário">Voluntário</option><option value="Involuntário">Involuntário (Lei 10.216/2001)</option><option value="Compulsório">Compulsório (Ordem judicial)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Tipo</label>
            <select name="tipoAtendimento" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Selecione</option><option>Dep. química</option><option>Alcoolismo</option><option>Transtorno mental</option><option>Misto</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Nível de urgência</label>
            <select name="nivelUrgencia" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Selecione</option><option>Imediato</option><option>Urgente</option><option>Programado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Seção 5 — Dados do Transporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs font-medium text-gray-600">Origem *</label><Input name="origem" required /></div>
          <div><label className="text-xs font-medium text-gray-600">Destino (unidade) *</label><Input name="destino" required /></div>
          <div><label className="text-xs font-medium text-gray-600">Cidade destino</label><Input name="cidadeDestino" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Seção 6 — Valor do Serviço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs font-medium text-gray-600">Valor (R$)</label><Input name="valor" placeholder="0,00" /></div>
          <div>
            <label className="text-xs font-medium text-gray-600">Forma de pagamento</label>
            <select name="formaPagamento" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Selecione</option><option>PIX</option><option>Cartão</option><option>Dinheiro</option><option>Transferência</option><option>Boleto</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-2">
        <p><strong>Declaração:</strong> O serviço consiste na condução assistida, sem procedimentos médicos. Declaro ter solicitado voluntariamente o transporte.</p>
        <p><strong>Nota:</strong> Equipe atua apenas na condução segura. Após o recebimento na unidade, a responsabilidade assistencial passa à unidade.</p>
      </div>
    </>
  );
}
