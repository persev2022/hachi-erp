"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useTerminology } from "@/hooks/use-terminology";
import { useToast } from "@/components/ui/toast-simple";

export default function NovoPacientePage() {
  const { show } = useToast();
  const router = useRouter();
  const terms = useTerminology();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [quartos, setQuartos] = React.useState<{ id: string; numero: string }[]>([]);

  // Fetch available rooms
  React.useEffect(() => {
    fetch("/api/quartos?status=DISPONIVEL")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setQuartos(d.data || []);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
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
      quartoId: form.get("quartoId") || undefined,
      mensalidadeValor: parseFloat(form.get("mensalidadeValor") as string) || undefined,
      diaVencimento: parseInt(form.get("diaVencimento") as string) || undefined,
    };

    // Build responsavel if provided
    const respNome = form.get("respNome") as string;
    if (respNome) {
      payload.responsavel = {
        nome: respNome,
        cpf: (form.get("respCpf") as string || "").replace(/\D/g, ""),
        parentesco: form.get("respParentesco"),
        telefone: form.get("respTelefone"),
        email: form.get("respEmail") || "",
        isFinanceiro: true,
      };
    }

    try {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.details) {
          setErrors(data.details);
        }
        show(data.error || "Erro ao salvar paciente", "error");
        return;
      }

      show("Paciente cadastrado com sucesso!", "success");
      router.push(`/pacientes/${data.data.id}`);
    } catch {
      show("Erro de conexão ao salvar paciente", "error");
    } finally {
      setLoading(false);
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
          <Link href="/pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Novo Paciente</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados para admissão
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            <CardDescription>
              Informações de identificação do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome Completo *
              </label>
              <Input name="nome" placeholder="Nome completo do paciente" required />
              {fieldError("nome")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">CPF *</label>
              <Input name="cpf" placeholder="000.000.000-00" required />
              {fieldError("cpf")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Data de Nascimento *
              </label>
              <Input name="dataNascimento" type="date" required />
              {fieldError("dataNascimento")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Sexo *
              </label>
              <select
                name="sexo"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
              {fieldError("sexo")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Estado Civil *
              </label>
              <select
                name="estadoCivil"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione</option>
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
              {fieldError("estadoCivil")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Telefone
              </label>
              <Input name="telefone" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input name="email" type="email" placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Profissão
              </label>
              <Input name="profissao" placeholder="Profissão" />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endereço</CardTitle>
            <CardDescription>Endereço residencial do paciente</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">Rua</label>
              <Input name="endereco" placeholder="Rua, número, complemento" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Bairro
              </label>
              <Input name="bairro" placeholder="Bairro" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Cidade
              </label>
              <Input name="cidade" placeholder="Cidade" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">UF</label>
              <Input name="uf" placeholder="UF" maxLength={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">CEP</label>
              <Input name="cep" placeholder="00000-000" />
            </div>
          </CardContent>
        </Card>

        {/* Dados Clínicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Clínicos</CardTitle>
            <CardDescription>
              Histórico clínico e informações de saúde
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Substância Principal
              </label>
              <select
                name="substanciaPrincipal"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione</option>
                <option value="Álcool">Álcool</option>
                <option value="Cocaína">Cocaína</option>
                <option value="Crack">Crack</option>
                <option value="Maconha">Maconha</option>
                <option value="Múltiplas Substâncias">Múltiplas Substâncias</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tempo de Uso
              </label>
              <Input name="tempoUso" placeholder="Ex: 5 anos" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Internações Prévias
              </label>
              <Input name="internacoesPrevias" type="number" placeholder="0" min={0} defaultValue={0} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Comorbidades
              </label>
              <Input name="comorbidades" placeholder="Ex: Depressão, Ansiedade" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Alergias
              </label>
              <Input name="alergias" placeholder="Alergias conhecidas" />
            </div>
          </CardContent>
        </Card>

        {/* Tratamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{terms.admissao}</CardTitle>
            <CardDescription>Dados de entrada</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {terms.admissao} *
              </label>
              <Input name="dataAdmissao" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
              {fieldError("dataAdmissao")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {terms.diasTratamento} *
              </label>
              <Input name="diasTratamento" type="number" placeholder="90" min={1} required defaultValue={90} />
              {fieldError("diasTratamento")}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {terms.quarto}
              </label>
              <select
                name="quartoId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione</option>
                {quartos.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.numero}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Responsável</CardTitle>
            <CardDescription>
              Dados do responsável legal ou familiar de referência
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome do Responsável
              </label>
              <Input name="respNome" placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                CPF do Responsável
              </label>
              <Input name="respCpf" placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Parentesco
              </label>
              <select
                name="respParentesco"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione</option>
                <option value="Pai">Pai</option>
                <option value="Mãe">Mãe</option>
                <option value="Cônjuge">Cônjuge</option>
                <option value="Irmão(ã)">Irmão(ã)</option>
                <option value="Filho(a)">Filho(a)</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Telefone
              </label>
              <Input name="respTelefone" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input name="respEmail" type="email" placeholder="email@exemplo.com" />
            </div>
          </CardContent>
        </Card>

        {/* Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financeiro</CardTitle>
            <CardDescription>Dados de cobrança e pagamento</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mensalidade (R$)
              </label>
              <Input name="mensalidadeValor" type="number" placeholder="0.00" min={0} step={0.01} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Dia de Vencimento
              </label>
              <select
                name="diaVencimento"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione</option>
                <option value="5">Dia 5</option>
                <option value="20">Dia 20</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" asChild>
            <Link href="/pacientes">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Paciente
          </Button>
        </div>
      </form>
    </div>
  );
}
