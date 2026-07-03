"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";

interface ClinicaData {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoMunicipal: string;
  alvara: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  responsavelTecnico: string;
  crmResponsavel: string;
}

export default function ClinicaConfigPage() {
  const { show } = useToast();
  const [data, setData] = React.useState<ClinicaData>({
    razaoSocial: "", nomeFantasia: "", cnpj: "", inscricaoMunicipal: "",
    alvara: "", telefone: "", email: "", endereco: "", cidade: "", uf: "",
    cep: "", responsavelTecnico: "", crmResponsavel: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/configuracoes/integracoes")
      .then((r) => r.json())
      .then((d) => {
        // Read clinica data from system_config if exists
        // For now, try to load from a separate key
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load from system config
    fetch("/api/configuracoes/clinica")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/configuracoes/clinica", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) show("Dados salvos!", "success");
      else show(result.error || "Erro ao salvar", "error");
    } catch { show("Erro de conexão", "error"); }
    finally { setSaving(false); }
  };

  const handleChange = (field: keyof ClinicaData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Building className="h-5 w-5" /> Dados da Clínica
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Informações cadastrais da empresa</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identificação</CardTitle>
          <CardDescription>Razão social, CNPJ e registros</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Razão Social</label>
            <Input value={data.razaoSocial} onChange={(e) => handleChange("razaoSocial", e.target.value)} placeholder="Razão social completa" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome Fantasia</label>
            <Input value={data.nomeFantasia} onChange={(e) => handleChange("nomeFantasia", e.target.value)} placeholder="Hachi Clínica" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CNPJ</label>
            <Input value={data.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} placeholder="00.000.000/0001-00" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Inscrição Municipal</label>
            <Input value={data.inscricaoMunicipal} onChange={(e) => handleChange("inscricaoMunicipal", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Alvará de Funcionamento</label>
            <Input value={data.alvara} onChange={(e) => handleChange("alvara", e.target.value)} placeholder="Nº do alvará" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contato e Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone</label>
            <Input value={data.telefone} onChange={(e) => handleChange("telefone", e.target.value)} placeholder="(00) 0000-0000" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={data.email} onChange={(e) => handleChange("email", e.target.value)} type="email" placeholder="contato@clinica.com" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <Input value={data.endereco} onChange={(e) => handleChange("endereco", e.target.value)} placeholder="Rua, número, bairro" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cidade</label>
            <Input value={data.cidade} onChange={(e) => handleChange("cidade", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">UF</label>
              <Input value={data.uf} onChange={(e) => handleChange("uf", e.target.value)} maxLength={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CEP</label>
              <Input value={data.cep} onChange={(e) => handleChange("cep", e.target.value)} placeholder="00000-000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Responsável Técnico</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input value={data.responsavelTecnico} onChange={(e) => handleChange("responsavelTecnico", e.target.value)} placeholder="Dr. Nome Completo" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CRM</label>
            <Input value={data.crmResponsavel} onChange={(e) => handleChange("crmResponsavel", e.target.value)} placeholder="CRM/UF 00000" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar Dados
        </Button>
      </div>
    </div>
  );
}
