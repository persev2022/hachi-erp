"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("As senhas não coincidem"); return; }
    if (password.length < 8) { setError("Senha deve ter pelo menos 8 caracteres"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.error || "Erro ao redefinir senha");
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Link inválido. Solicite um novo link de redefinição.</p>
          <Button asChild className="mt-4"><Link href="/login">Voltar ao login</Link></Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6 text-center">
          <p className="text-emerald-600 font-medium">Senha redefinida com sucesso!</p>
          <Button asChild className="mt-4"><Link href="/login">Fazer login</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle>Redefinir Senha</CardTitle>
        <CardDescription>Escolha uma nova senha segura</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova Senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Senha</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a nova senha" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
