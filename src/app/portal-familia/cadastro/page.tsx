"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Loader2, CheckCircle2 } from "lucide-react";

interface Paciente {
  id: string;
  nome: string;
}

export default function CadastroFamiliarPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [token, setToken] = React.useState("");

  // Form
  const [selectedPaciente, setSelectedPaciente] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [parentesco, setParentesco] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [cpf, setCpf] = React.useState("");

  React.useEffect(() => {
    fetch("/api/portal-familia/pacientes-lista")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPacientes(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPaciente || !nome || !parentesco || !telefone) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/portal-familia/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: selectedPaciente,
          nome,
          parentesco,
          telefone,
          email: email || undefined,
          cpf: cpf || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setSuccess(true);
      } else {
        setError(data.error || "Erro ao cadastrar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-lg text-center">
          <CardContent className="p-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold">Cadastro realizado!</h2>
            <p className="text-sm text-muted-foreground">
              Seu token de acesso ao Portal da Família é:
            </p>
            <code className="block bg-muted p-3 rounded-lg font-mono text-sm break-all">
              {token.match(/.{1,4}/g)?.join("-")}
            </code>
            <p className="text-xs text-muted-foreground">
              Guarde este token — ele é sua chave de acesso ao portal.
            </p>
            <Button className="w-full" onClick={() => router.push("/portal-familia")}>
              Acessar Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Cadastro de Familiar</CardTitle>
          <CardDescription>
            Preencha seus dados para receber acesso ao Portal da Família e acompanhar o tratamento do seu ente querido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Paciente *</label>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                </div>
              ) : (
                <select
                  value={selectedPaciente}
                  onChange={(e) => setSelectedPaciente(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione o paciente...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Seu nome completo *</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Maria da Silva" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Parentesco *</label>
              <select
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                <option value="Mãe">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Cônjuge">Cônjuge</option>
                <option value="Irmão(ã)">Irmão(ã)</option>
                <option value="Filho(a)">Filho(a)</option>
                <option value="Tio(a)">Tio(a)</option>
                <option value="Avô(ó)">Avô(ó)</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone (WhatsApp) *</label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(48) 99999-9999" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CPF</label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Cadastrar e Gerar Token
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao se cadastrar, você concorda com a política de privacidade da clínica.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
