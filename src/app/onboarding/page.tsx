"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const verticals = [
  { id: "recovery", label: "Comunidade Terapêutica", desc: "CTs e centros de reabilitação" },
  { id: "clinic", label: "Clínica Médica", desc: "Clínicas, consultórios e centros de saúde" },
  { id: "senior", label: "Casa de Repouso", desc: "ILPIs e cuidado ao idoso" },
  { id: "hotel", label: "Hotelaria", desc: "Hotéis, pousadas e resorts" },
  { id: "restaurant", label: "Restaurante", desc: "Restaurantes, bares e delivery" },
  { id: "education", label: "Escola", desc: "Escolas, cursos e instituições" },
  { id: "vet", label: "Veterinária", desc: "Clínicas vet e pet shops" },
  { id: "services", label: "Prestador de Serviço", desc: "Agências, consultorias, escritórios" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [vertical, setVertical] = React.useState("");
  const [orgName, setOrgName] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, vertical, userName, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erro ao criar conta");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
          <p className="text-sm text-gray-500 mt-1">Configure sua organização em menos de 2 minutos</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 rounded-full transition-all ${s === step ? "w-8 bg-teal-600" : s < step ? "w-8 bg-teal-200" : "w-8 bg-gray-200"}`} />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}

        {/* Step 1: Choose Vertical */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-3">Qual é o segmento do seu negócio?</p>
            <div className="grid grid-cols-2 gap-2">
              {verticals.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setVertical(v.id); setStep(2); }}
                  className={`text-left p-3 rounded-xl border transition-all ${vertical === v.id ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"}`}
                >
                  <p className="text-sm font-medium text-gray-900">{v.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Organization */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Dados da organização</p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Nome da organização *</label>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Ex: Clínica São Lucas"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Seu nome completo *</label>
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">← Voltar</button>
              <button onClick={() => { if (orgName && userName) setStep(3); }} disabled={!orgName || !userName} className="flex-1 bg-teal-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Credentials */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Credenciais de acesso</p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Senha (mín. 8 caracteres) *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">← Voltar</button>
              <button onClick={handleSubmit} disabled={loading || !email || password.length < 8} className="flex-1 bg-teal-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition">
                {loading ? "Criando..." : "Criar Conta"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Já tem conta? <a href="/login" className="text-teal-600 hover:underline">Fazer login</a>
        </p>
      </div>
    </div>
  );
}
