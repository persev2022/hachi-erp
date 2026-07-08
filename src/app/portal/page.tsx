/* eslint-disable @next/next/no-img-element */
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PortalPage() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal-familia/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Token inválido");
        return;
      }
      // Store token and redirect to dashboard
      localStorage.setItem("portal-token", token.trim());
      router.push("/portal-familia/dashboard");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/images/hachi-logo.png" alt="Hachi" className="h-16 w-16 mx-auto mb-4 rounded-xl" />
          <h1 className="text-xl font-bold text-gray-900">Portal de Acesso</h1>
          <p className="text-sm text-gray-500 mt-1">Insira seu token de acesso para visualizar informações.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Token de acesso</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole seu token aqui"
              required
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-teal-600 text-white font-medium py-2.5 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Acessar Portal
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          Hachi Platform · Portal Seguro
        </p>
      </div>
    </div>
  );
}
