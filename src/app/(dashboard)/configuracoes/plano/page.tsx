"use client";

import * as React from "react";
import { Crown, Users, Heart, Check, AlertCircle } from "lucide-react";

interface UsageData {
  current: number;
  max: number;
  unlimited: boolean;
}

interface PlanData {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: { maxUsers: number; maxPatients: number };
}

export default function PlanoPage() {
  const [loading, setLoading] = React.useState(true);
  const [currentPlan, setCurrentPlan] = React.useState<{ id: string; name: string; price: number } | null>(null);
  const [users, setUsers] = React.useState<UsageData>({ current: 0, max: 5, unlimited: false });
  const [patients, setPatients] = React.useState<UsageData>({ current: 0, max: 50, unlimited: false });
  const [plans, setPlans] = React.useState<PlanData[]>([]);
  const [withinLimits, setWithinLimits] = React.useState(true);
  const [upgradeMsg, setUpgradeMsg] = React.useState("");

  React.useEffect(() => {
    fetch("/api/platform/billing")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCurrentPlan(d.data.plan);
          setUsers(d.data.usage.users);
          setPatients(d.data.usage.patients);
          setPlans(d.data.availablePlans);
          setWithinLimits(d.data.withinLimits);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Carregando...</div>;

  const usagePercent = (current: number, max: number, unlimited: boolean) =>
    unlimited ? 5 : Math.min((current / max) * 100, 100);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-teal-600" />
        <h1 className="text-xl font-semibold">Plano & Faturamento</h1>
      </div>

      {!withinLimits && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">Você excedeu os limites do seu plano. Considere fazer upgrade.</span>
        </div>
      )}

      {/* Usage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Users className="h-4 w-4" /> Usuários
          </div>
          <p className="text-lg font-medium">{users.current} / {users.unlimited ? "∞" : users.max}</p>
          <div className="mt-2 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${usagePercent(users.current, users.max, users.unlimited)}%` }} />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Heart className="h-4 w-4" /> Pacientes
          </div>
          <p className="text-lg font-medium">{patients.current} / {patients.unlimited ? "∞" : patients.max}</p>
          <div className="mt-2 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${usagePercent(patients.current, patients.max, patients.unlimited)}%` }} />
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan?.id;
          return (
            <div key={plan.id} className={`border rounded-lg p-4 flex flex-col ${isCurrent ? "border-teal-500 ring-2 ring-teal-100" : ""}`}>
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1">R$ {plan.price}<span className="text-sm font-normal text-zinc-500">/mês</span></p>
              <ul className="mt-3 space-y-1.5 flex-1 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="mt-4 text-center text-sm font-medium text-teal-700 bg-teal-50 rounded py-2">Plano atual</div>
              ) : plan.price > (currentPlan?.price || 0) ? (
                <button onClick={() => setUpgradeMsg(`Entre em contato para upgrade para o plano ${plan.name}.`)} className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded transition-colors">
                  Upgrade
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {upgradeMsg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          {upgradeMsg}
        </div>
      )}
    </div>
  );
}
