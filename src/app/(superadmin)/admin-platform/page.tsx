"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Activity,
  Server,
  Plus,
  Settings,
  BarChart3,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  plan: string;
  active: boolean;
  usersCount: number;
  createdAt: string;
}

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  verticals: Record<string, number>;
}

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

const verticalColors: Record<string, string> = {
  recovery: "bg-teal-100 text-teal-700 border-teal-200",
  clinic: "bg-blue-100 text-blue-700 border-blue-200",
  hotel: "bg-purple-100 text-purple-700 border-purple-200",
  restaurant: "bg-amber-100 text-amber-700 border-amber-200",
  senior: "bg-rose-100 text-rose-700 border-rose-200",
  education: "bg-indigo-100 text-indigo-700 border-indigo-200",
  vet: "bg-green-100 text-green-700 border-green-200",
  services: "bg-gray-100 text-gray-700 border-gray-200",
};

const planLabels: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export default function SuperAdminPage() {
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      const res = await fetch("/api/platform/tenants");
      const data = await res.json();
      if (data.success) setTenants(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const stats: PlatformStats = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.active).length,
    totalUsers: tenants.reduce((s, t) => s + t.usersCount, 0),
    verticals: tenants.reduce((acc, t) => {
      acc[t.vertical] = (acc[t.vertical] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      slug: form.get("slug"),
      vertical: form.get("vertical"),
      plan: form.get("plan"),
    };

    try {
      const res = await fetch("/api/platform/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erro ao criar tenant");
        return;
      }
      setShowCreate(false);
      fetchTenants();
    } catch {
      setError("Erro de conexão");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm text-gray-900">Hachi Platform</h1>
                <p className="text-[10px] text-gray-500">Super Admin Console</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" /> Novo Tenant
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
                <p className="text-xs text-gray-500">Tenants</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTenants}</p>
                <p className="text-xs text-gray-500">Ativos</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">Usuários Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Server className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.verticals).length}</p>
                <p className="text-xs text-gray-500">Verticais</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Organizações</h2>
            <span className="text-xs text-gray-500">{tenants.length} tenant{tenants.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900">{tenant.name}</p>
                      {tenant.active ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{tenant.slug} · {tenant.usersCount} usuários</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${verticalColors[tenant.vertical] || "bg-gray-100 text-gray-600"}`}>
                    {verticalLabels[tenant.vertical] || tenant.vertical}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {planLabels[tenant.plan] || tenant.plan}
                  </span>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                    <Settings className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verticals Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Verticais Disponíveis</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(verticalLabels).map(([key, label]) => (
              <div key={key} className={`border rounded-xl p-4 text-center ${stats.verticals[key] ? "border-indigo-200 bg-indigo-50/50" : "border-gray-200"}`}>
                <p className="font-medium text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.verticals[key] || 0} tenant{(stats.verticals[key] || 0) !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Tenant Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900">Criar Novo Tenant</h3>
              <p className="text-sm text-gray-500 mt-1">Configure uma nova organização na plataforma.</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome da Organização *</label>
                <input
                  name="name"
                  required
                  placeholder="Ex: Clínica São Lucas"
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug (identificador único) *</label>
                <input
                  name="slug"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="Ex: clinica-sao-lucas"
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-[11px] text-gray-400">Apenas letras minúsculas, números e hífens</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Vertical *</label>
                  <select
                    name="vertical"
                    required
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="recovery">Recovery (CTs)</option>
                    <option value="clinic">Clinic (Clínicas)</option>
                    <option value="senior">Senior (ILPIs)</option>
                    <option value="hotel">Hotel (Hotelaria)</option>
                    <option value="restaurant">Restaurant (Gastronomia)</option>
                    <option value="education">Education (Escolas)</option>
                    <option value="vet">Vet (Veterinária)</option>
                    <option value="services">Services (Prestadores)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Plano *</label>
                  <select
                    name="plan"
                    required
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Criar Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
