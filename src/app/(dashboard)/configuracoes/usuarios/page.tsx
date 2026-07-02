"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast-simple";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  phone: string | null;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  MEDICO: "Médico",
  PSICOLOGO: "Psicólogo",
  ENFERMEIRO: "Enfermeiro",
  TERAPEUTA: "Terapeuta",
  SECRETARIA: "Secretária",
  FINANCEIRO: "Financeiro",
  MONITOR: "Monitor",
  APOIO: "Apoio",
};

export default function UsuariosPage() {
  const { show } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users?active=");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: form.get("role"),
      phone: form.get("phone") || undefined,
      crm: form.get("crm") || undefined,
      crp: form.get("crp") || undefined,
      coren: form.get("coren") || undefined,
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        show("Usuário criado!", "success");
        setShowForm(false);
        fetchUsers();
      } else show(data.error || "Erro", "error");
    } catch { show("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const data = await res.json();
      if (data.success) { show(active ? "Usuário desativado" : "Usuário ativado", "success"); fetchUsers(); }
      else show(data.error || "Erro", "error");
    } catch { show("Erro", "error"); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciar equipe e permissões</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />Novo Usuário
        </Button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Novo Usuário</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input name="name" required placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input name="email" type="email" required placeholder="email@hachi.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha *</label>
                <Input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Perfil *</label>
                <select name="role" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {Object.entries(roleLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input name="phone" placeholder="(00) 00000-0000" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">CRM</label>
                  <Input name="crm" placeholder="CRM" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">CRP</label>
                  <Input name="crp" placeholder="CRP" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">COREN</label>
                  <Input name="coren" placeholder="COREN" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className={!user.active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => toggleActive(user.id, user.active)}
                    >
                      {user.active ? "Desativar" : "Ativar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
