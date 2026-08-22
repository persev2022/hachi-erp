"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";
import { useTerminology } from "@/hooks/use-terminology";

/**
 * Parse a currency value typed in BR format (e.g. "2.500,00" or "2500" or "2500.00").
 * Handles the ambiguity of pt-BR locale where dots are thousands separators.
 */
function parseCurrencyValue(raw: string | null): number | undefined {
  if (!raw || raw.trim() === "") return undefined;
  let cleaned = raw.trim();
  // If contains comma, treat it as decimal separator (BR format: "2.500,00" → "2500.00")
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }
  const val = parseFloat(cleaned);
  return isNaN(val) || val <= 0 ? undefined : val;
}

export default function EditarPacientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const terms = useTerminology();
  const { show } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [paciente, setPaciente] = React.useState<any>(null);
  const [responsaveis, setResponsaveis] = React.useState<any[]>([]);
  const [foto, setFoto] = React.useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = React.useState(false);

  React.useEffect(() => {
    async function fetchPaciente() {
      try {
        const res = await fetch(`/api/pacientes/${id}`);
        const data = await res.json();
        if (data.success) {
          setPaciente(data.data);
          setResponsaveis(data.data.responsaveis || []);
          setFoto(data.data.foto || null);
        } else {
          show(data.error || "Paciente não encontrado", "error");
        }
      } catch {
        show("Erro ao carregar paciente", "error");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPaciente();
  }, [id, show]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const form = new FormData(e.currentTarget);

    const payload: any = {
      nome: form.get("nome"),
      cpf: (form.get("cpf") as string).replace(/\D/g, ""),
      dataNascimento: form.get("dataNascimento"),
      sexo: form.get("sexo"),
      estadoCivil: form.get("estadoCivil"),
      profissao: form.get("profissao") || undefined,
      telefone: form.get("telefone") || undefined,
      email: form.get("email") || "",
      status: form.get("status"),
      endereco: form.get("endereco") || undefined,
      bairro: form.get("bairro") || undefined,
      cidade: form.get("cidade") || undefined,
      uf: form.get("uf") || undefined,
      cep: form.get("cep") || undefined,
      substanciaPrincipal: form.get("substanciaPrincipal") || undefined,
      tempoUso: form.get("tempoUso") || undefined,
      internacoesPrevias: parseInt(form.get("internacoesPrevias") as string) || 0,
      comorbidades: form.get("comorbidades") || undefined,
      alergias: form.get("alergias") || undefined,
      dataAdmissao: form.get("dataAdmissao"),
      diasTratamento: parseInt(form.get("diasTratamento") as string) || 90,
      mensalidadeValor: parseCurrencyValue(form.get("mensalidadeValor") as string),
      diaVencimento: parseInt(form.get("diaVencimento") as string) || undefined,
      foto: foto || null,
      responsaveis: responsaveis.map(r => ({
        id: r.id || undefined,
        nome: r.nome,
        cpf: (r.cpf || "").replace(/\D/g, ""),
        parentesco: r.parentesco,
        telefone: r.telefone,
        email: r.email || "",
        endereco: r.endereco || "",
        profissao: r.profissao || "",
        estadoCivil: r.estadoCivil || null,
        isFinanceiro: r.isFinanceiro !== false,
      })),
    };

    try {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.details) setErrors(data.details);
        show(data.error || "Erro ao salvar", "error");
        return;
      }

      show("Paciente atualizado com sucesso!", "success");
      router.push(`/pacientes/${id}`);
    } catch {
      show("Erro de conexão", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Paciente não encontrado
        </div>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/pacientes">← Voltar</Link>
        </Button>
      </div>
    );
  }

  // Format date for input[type=date]
  const formatDateInput = (d: string | null | undefined) => {
    if (!d) return "";
    try {
      // Use UTC to avoid timezone shift
      const date = new Date(d);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const fieldError = (field: string) =>
    errors[field] ? (
      <p className="text-xs text-destructive mt-1">{errors[field][0]}</p>
    ) : null;

  const updateResp = (idx: number, field: string, value: any) => {
    setResponsaveis(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pacientes/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Editar Paciente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{paciente.nome}</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Foto do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Foto</CardTitle>
            <CardDescription>Foto de identificação do paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {foto ? (
                <img
                  src={foto}
                  alt="Foto do paciente"
                  className="h-20 w-20 rounded-full object-cover border-2 border-muted"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {paciente.nome
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingFoto}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingFoto(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("context", "patient");
                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.success) {
                        setFoto(data.data.url);
                        show("Foto carregada!", "success");
                      } else {
                        show(data.error || "Erro ao enviar foto", "error");
                      }
                    } catch {
                      show("Erro ao enviar foto", "error");
                    } finally {
                      setUploadingFoto(false);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP. Máximo 2MB.</p>
                {foto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={() => setFoto(null)}
                  >
                    Remover foto
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            <CardDescription>Informações de identificação</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Nome Completo *</label>
              <Input name="nome" defaultValue={paciente.nome} required />
              {fieldError("nome")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CPF *</label>
              <Input name="cpf" defaultValue={paciente.cpf} required />
              {fieldError("cpf")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Nascimento *</label>
              <Input
                name="dataNascimento"
                type="date"
                defaultValue={formatDateInput(paciente.dataNascimento)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sexo *</label>
              <select
                name="sexo"
                defaultValue={paciente.sexo}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado Civil *</label>
              <select
                name="estadoCivil"
                defaultValue={paciente.estadoCivil}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                defaultValue={paciente.status}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ATIVO">Ativo</option>
                <option value="ALTA">Alta</option>
                <option value="EVADIDO">Evadido</option>
                <option value="TRANSFERIDO">Transferido</option>
                <option value="OBITO">Óbito</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input name="telefone" defaultValue={paciente.telefone || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" defaultValue={paciente.email || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Profissão</label>
              <Input name="profissao" defaultValue={paciente.profissao || ""} />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Rua</label>
              <Input name="endereco" defaultValue={paciente.endereco || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bairro</label>
              <Input name="bairro" defaultValue={paciente.bairro || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Input name="cidade" defaultValue={paciente.cidade || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">UF</label>
              <Input name="uf" defaultValue={paciente.uf || ""} maxLength={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CEP</label>
              <Input name="cep" defaultValue={paciente.cep || ""} />
            </div>
          </CardContent>
        </Card>

        {/* Dados Clínicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Clínicos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Substância Principal</label>
              <Input
                name="substanciaPrincipal"
                defaultValue={paciente.substanciaPrincipal || ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tempo de Uso</label>
              <Input name="tempoUso" defaultValue={paciente.tempoUso || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Internações Prévias</label>
              <Input
                name="internacoesPrevias"
                type="number"
                defaultValue={paciente.internacoesPrevias || 0}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comorbidades</label>
              <Input name="comorbidades" defaultValue={paciente.comorbidades || ""} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Alergias</label>
              <Input name="alergias" defaultValue={paciente.alergias || ""} />
            </div>
          </CardContent>
        </Card>

        {/* Tratamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{terms.admissao}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{terms.admissao} *</label>
              <Input
                name="dataAdmissao"
                type="date"
                defaultValue={formatDateInput(paciente.dataAdmissao)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{terms.diasTratamento} *</label>
              <Input
                name="diasTratamento"
                type="number"
                defaultValue={paciente.diasTratamento}
                min={1}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensalidade (R$)</label>
              <Input
                name="mensalidadeValor"
                type="text"
                inputMode="decimal"
                defaultValue={paciente.mensalidadeValor || ""}
                placeholder="Ex: 2500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dia Vencimento</label>
              <select
                name="diaVencimento"
                defaultValue={paciente.diaVencimento || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione</option>
                <option value="5">Dia 5</option>
                <option value="20">Dia 20</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Responsável(eis) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Responsável Financeiro</CardTitle>
                <CardDescription>Dados do responsável pelo paciente</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResponsaveis([...responsaveis, {
                  nome: "", cpf: "", parentesco: "", telefone: "", email: "", endereco: "", isFinanceiro: true
                }])}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {responsaveis.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhum responsável cadastrado
              </div>
            )}
            {responsaveis.map((resp, idx) => (
              <div key={resp.id || `new-${idx}`} className="p-4 border rounded-lg space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Responsável {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setResponsaveis(responsaveis.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nome *</label>
                    <Input
                      value={resp.nome}
                      onChange={e => updateResp(idx, "nome", e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">CPF *</label>
                    <Input
                      value={resp.cpf}
                      onChange={e => updateResp(idx, "cpf", e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Parentesco *</label>
                    <select
                      value={resp.parentesco}
                      onChange={e => updateResp(idx, "parentesco", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="mãe">Mãe</option>
                      <option value="pai">Pai</option>
                      <option value="cônjuge">Cônjuge</option>
                      <option value="irmão(ã)">Irmão(ã)</option>
                      <option value="filho(a)">Filho(a)</option>
                      <option value="tio(a)">Tio(a)</option>
                      <option value="avô(ó)">Avô(ó)</option>
                      <option value="amigo(a)">Amigo(a)</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Telefone *</label>
                    <Input
                      value={resp.telefone}
                      onChange={e => updateResp(idx, "telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Email</label>
                    <Input
                      value={resp.email || ""}
                      onChange={e => updateResp(idx, "email", e.target.value)}
                      type="email"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Endereço</label>
                    <Input
                      value={resp.endereco || ""}
                      onChange={e => updateResp(idx, "endereco", e.target.value)}
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={resp.isFinanceiro !== false}
                    onChange={e => updateResp(idx, "isFinanceiro", e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                    id={`isFinanceiro-${idx}`}
                  />
                  <label htmlFor={`isFinanceiro-${idx}`} className="text-xs text-muted-foreground">
                    É o responsável financeiro
                  </label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" asChild>
            <Link href={`/pacientes/${id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
