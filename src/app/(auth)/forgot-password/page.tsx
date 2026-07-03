"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {}
    finally { setLoading(false); }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-emerald-600 font-medium">Email enviado!</p>
          <p className="text-sm text-muted-foreground">
            Se o email existir no sistema, enviaremos instruções para redefinir sua senha.
          </p>
          <Button asChild variant="outline"><Link href="/login">Voltar ao login</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle>Esqueci minha senha</CardTitle>
        <CardDescription>Informe seu email para receber o link de redefinição</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
          <div className="text-center">
            <Link href="/login" className="text-xs text-muted-foreground hover:underline">Voltar ao login</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
