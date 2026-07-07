"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  plan: string;
  active: boolean;
  config: {
    features?: Record<string, boolean>;
    branding?: { name?: string; primaryColor?: string };
  } | null;
  createdAt: string;
  updatedAt: string;
  users: TenantUser[];
}

const FEATURE_LABELS: Record<string, string> = {
  financeiro: "Financeiro",
  agenda: "Agenda",
  documentos: "Documentos",
  estoque: "Estoque",
  comunicacao: "Comunicação",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  prontuario: "Prontuário",
  portalFamilia: "Portal Família",
  quartos: "Quartos",
  prescricoes: "Prescrições",
  crm: "CRM",
  pdv: "PDV",
  delivery: "Delivery",
  reservas: "Reservas",
};

const verticalLabels: Record<string, string> = {
  recovery: "Recovery",
  clinic: "Clinic",
  hotel: "Hotel",
  restaurant: "Restaurant",
  senior: "Senior",
  education: "Education",
  vet: "Vet",
  services: "Services",
};

const planLabels: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  COORDENADOR: "Coordenador",
  MEDICO: "Médico",
  PSICOLOGO: "Psicólogo",
  ENFERMEIRO: "Enfermeiro",
  TERAPEUTA: "Terapeuta",
  SECRETARIA: "Secretária",
  FINANCEIRO: "Financeiro",
  MONITOR: "Monitor",
  APOIO: "Apoio",
};

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = React.useState<TenantDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toggling, setToggling] = React.useState(false);
  const [features, setFeatures] = React.useState<Record<string, boolean>>({});
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    fetchTenant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  async function fetchTenant() {
    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}`);
      const data = await res.json();
      if (data.success) {
        setTenant(data.data);
        setFeatures(data.data.config?.features || {});
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    if (!tenant) return;
    setToggling(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !tenant.active }),
      });
      const data = await res.json();
      if (data.success) {
        setTenant({ ...tenant, active: !tenant.active });
        setMessage({ type: "success", text: `Tenant ${!tenant.active ? "ativado" : "desativado"} com sucesso` });
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao atualizar" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro de conexão" });
    } finally {
      setToggling(false);
    }
  }

  async function handleSaveFeatures() {
    if (!tenant) return;
    setSaving(true);
    setMessage(null);

    const updatedConfig = {
      ...(tenant.config || {}),
      features,
    };

    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: updatedConfig }),
      });
      const data = await res.json();
      if (data.success) {
        setTenant({ ...tenant, config: updatedConfig });
        setMessage({ type: "success", text: "Features salvas com sucesso" });
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao salvar features" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro de conexão" });
    } finally {
      setSaving(false);
    }
  }

  function toggleFeature(key: string) {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <p className="text-gray-500">Tenant não encontrado</p>
        <Link href="/admin-platform" className="text-indigo-600 text-sm hover:underline">
          ← Voltar ao painel
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-platform" className="text-gray-400 hover:text-gray-600 transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm text-gray-900">{tenant.name}</h1>
                <p className="text-[10px] text-gray-500">Tenant Detail</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 ${
                tenant.active
                  ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              }`}
            >
              {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : tenant.active ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
              {tenant.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tenant Info Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Informações do Tenant</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Nome</p>
              <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Slug</p>
              <p className="text-sm font-mono text-gray-900">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Vertical</p>
              <p className="text-sm font-medium text-gray-900">{verticalLabels[tenant.vertical] || tenant.vertical}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Plano</p>
              <p className="text-sm font-medium text-gray-900">{planLabels[tenant.plan] || tenant.plan}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="flex items-center gap-1.5">
                {tenant.active ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-sm text-green-700">Ativo</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-sm text-red-600">Inativo</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Criado em</p>
              <p className="text-sm text-gray-900">
                {new Date(tenant.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Feature Flags Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Feature Flags</h2>
            <button
              onClick={handleSaveFeatures}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Features
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  features[key]
                    ? "border-indigo-200 bg-indigo-50/50"
                    : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={features[key] || false}
                  onChange={() => toggleFeature(key)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-900">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Users List Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Usuários</h2>
            </div>
            <span className="text-xs text-gray-500">
              {tenant.users.length} usuário{tenant.users.length !== 1 ? "s" : ""}
            </span>
          </div>
          {tenant.users.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">Nenhum usuário vinculado a este tenant</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tenant.users.map((user) => (
                <div key={user.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      {user.active ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {roleLabels[user.role] || user.role}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
