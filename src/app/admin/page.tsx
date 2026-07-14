"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        // Verify this is a SUPER_ADMIN or platform admin
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (meData.success && (meData.user?.role === "SUPER_ADMIN" || meData.user?.email === "admin@hachi.com")) {
          router.push("/admin-platform");
        } else {
          setError("Acesso restrito. Esta área é exclusiva para administradores da plataforma.");
          // Logout the non-super-admin session
          await fetch("/api/auth/logout", { method: "POST" });
        }
      } else {
        setError(data.error || "Credenciais inválidas");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Super Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Hachi Platform — Painel de Controle</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@hachi.com"
              className="mt-1 bg-slate-900 border-slate-600 text-white placeholder-slate-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Senha de super admin"
              className="mt-1 bg-slate-900 border-slate-600 text-white placeholder-slate-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
            Acessar Painel
          </Button>
        </form>

        <p className="text-center text-[10px] text-slate-500 mt-6">
          Acesso restrito a administradores da plataforma Hachi.
        </p>
      </div>
    </div>
  );
}
