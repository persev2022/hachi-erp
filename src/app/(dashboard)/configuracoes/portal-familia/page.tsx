"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-simple";
import { Plus, Copy, Eye, EyeOff, Users } from "lucide-react";

interface FamilyTokenItem {
  id: string;
  token: string;
  familiarNome: string;
  familiarPhone: string | null;
  active: boolean;
  lastAccess: string | null;
  createdAt: string;
  paciente: {
    id: string;
    nome: string;
    status: string;
  };
}

interface PacienteOption {
  id: string;
  nome: string;
}

function formatTokenDisplay(token: string): string {
  // Format: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  return token.match(/.{1,4}/g)?.join("-") || token;
}

function maskToken(token: string): string {
  const formatted = formatTokenDisplay(token);
  return formatted.slice(0, 9) + "••••-••••-••••-••••-••••" + formatted.slice(-4);
}

export default function PortalFamiliaConfigPage() {
  const { show } = useToast();
  const [tokens, setTokens] = React.useState<FamilyTokenItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [createdToken, setCreatedToken] = React.useState<string | null>(null);
  const [revealedTokens, setRevealedTokens] = React.useState<Set<string>>(new Set());

  // Form state
  const [pacientes, setPacientes] = React.useState<PacienteOption[]>([]);
  const [selectedPaciente, setSelectedPaciente] = React.useState("");
  const [familiarNome, setFamiliarNome] = React.useState("");
  const [familiarPhone, setFamiliarPhone] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const fetchTokens = React.useCallback(async () => {
    try {
      const res = await fetch("/api/portal-familia/tokens");
      const data = await res.json();
      if (data.success) {
        setTokens(data.tokens);
      }
    } catch {
      show("Erro ao carregar tokens", "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  const fetchPacientes = async () => {
    try {
      const res = await fetch("/api/pacientes?pageSize=100");
      const data = await res.json();
      if (data.success && data.data) {
        setPacientes(
          data.data.map((p: { id: string; nome: string }) => ({
            id: p.id,
            nome: p.nome,
          }))
        );
      }
    } catch {
      // silently fail
    }
  };

  React.useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const openModal = () => {
    fetchPacientes();
    setShowModal(true);
    setCreatedToken(null);
    setSelectedPaciente("");
    setFamiliarNome("");
    setFamiliarPhone("");
  };

  const handleCreate = async () => {
    if (!selectedPaciente || !familiarNome.trim()) {
      show("Selecione o paciente e informe o nome do familiar", "error");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/portal-familia/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: selectedPaciente,
          familiarNome: familiarNome.trim(),
          familiarPhone: familiarPhone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedToken(data.familyToken.token);
        fetchTokens();
        show("Token criado com sucesso!", "success");
      } else {
        show(data.error || "Erro ao criar token", "error");
      }
    } catch {
      show("Erro de conexão", "error");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (tokenId: string, active: boolean) => {
    try {
      const res = await fetch("/api/portal-familia/tokens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tokenId, active: !active }),
      });

      const data = await res.json();
      if (data.success) {
        setTokens((prev) =>
          prev.map((t) => (t.id === tokenId ? { ...t, active: !active } : t))
        );
        show(active ? "Token desativado" : "Token reativado", "success");
      }
    } catch {
      show("Erro ao atualizar token", "error");
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(formatTokenDisplay(token));
    show("Token copiado!", "success");
  };

  const toggleReveal = (id: string) => {
    setRevealedTokens((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Portal da Família
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie tokens de acesso para familiares dos pacientes
          </p>
        </div>
        <Button onClick={openModal}>
          <Plus className="h-4 w-4 mr-2" />
          Gerar Novo Token
        </Button>
      </div>

      {/* Token list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tokens Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : tokens.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum token gerado ainda. Clique em &quot;Gerar Novo Token&quot; para criar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Familiar</th>
                    <th className="pb-2 font-medium">Paciente</th>
                    <th className="pb-2 font-medium">Token</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Último Acesso</th>
                    <th className="pb-2 font-medium">Criado em</th>
                    <th className="pb-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{t.familiarNome}</p>
                          {t.familiarPhone && (
                            <p className="text-xs text-muted-foreground">{t.familiarPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3">{t.paciente.nome}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                            {revealedTokens.has(t.id) ? formatTokenDisplay(t.token) : maskToken(t.token)}
                          </code>
                          <button
                            onClick={() => toggleReveal(t.id)}
                            className="p-1 hover:bg-muted rounded"
                            title={revealedTokens.has(t.id) ? "Ocultar" : "Revelar"}
                          >
                            {revealedTokens.has(t.id) ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToken(t.token)}
                            className="p-1 hover:bg-muted rounded"
                            title="Copiar"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            t.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {t.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {t.lastAccess
                          ? new Date(t.lastAccess).toLocaleDateString("pt-BR")
                          : "Nunca"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(t.id, t.active)}
                        >
                          {t.active ? "Desativar" : "Ativar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create token modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-semibold mb-4">Gerar Novo Token</h2>

            {createdToken ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-emerald-800 mb-2">
                    Token gerado com sucesso!
                  </p>
                  <p className="text-xs text-emerald-600 mb-3">
                    Copie e envie ao familiar. Este token não será exibido novamente.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 break-all">
                      {formatTokenDisplay(createdToken)}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToken(createdToken)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setShowModal(false)}>
                  Fechar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Paciente</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={selectedPaciente}
                    onChange={(e) => setSelectedPaciente(e.target.value)}
                  >
                    <option value="">Selecione o paciente...</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Familiar</label>
                  <Input
                    placeholder="Ex: Maria da Silva (mãe)"
                    value={familiarNome}
                    onChange={(e) => setFamiliarNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Telefone <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <Input
                    placeholder="(48) 99999-9999"
                    value={familiarPhone}
                    onChange={(e) => setFamiliarPhone(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? "Gerando..." : "Gerar Token"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
