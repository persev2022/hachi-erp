"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
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

export default function EditarPacientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const terms = useTerminology();
  const { show } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [paciente, setPaciente] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchPaciente() {
      try {
        const res = await fetch(`/api/pacientes/${id}`);
        const data = await res.json();
        if (data.success) {
          setPaciente(data.data);
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
      mensalidadeValor: parseFloat(form.get("mensalidadeValor") as string) || undefined,
      diaVencimento: parseInt(form.get("diaVencimento") as string) || undefined,
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
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const fieldError = (field: string) =>
    errors[field] ? (
      <p className="text-xs text-destructive mt-1">{errors[field][0]}</p>
    ) : null;

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
                type="number"
                defaultValue={paciente.mensalidadeValor || ""}
                min={0}
                step={0.01}
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
