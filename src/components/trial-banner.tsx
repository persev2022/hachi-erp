"use client";

import * as React from "react";
import { AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TrialBanner() {
  const pathname = usePathname();
  const [show, setShow] = React.useState(false);
  const [daysLeft, setDaysLeft] = React.useState(0);
  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/platform")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.platform.trialEndsAt) {
          const ends = new Date(d.platform.trialEndsAt);
          const now = new Date();
          const days = Math.ceil((ends.getTime() - now.getTime()) / 86400000);
          if (days <= 7 && days > 0) {
            setShow(true);
            setDaysLeft(days);
          }
          if (days <= 0) {
            setShow(true);
            setDaysLeft(0);
            setExpired(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Allow access to billing page even when expired
  if (pathname === "/configuracoes/plano") return null;

  // Block entire UI when expired
  if (expired) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Período de teste expirado</h1>
          <p className="text-gray-500 mt-3">
            Seu período gratuito de 14 dias terminou. Para continuar usando a plataforma, escolha um plano.
          </p>
          <Link
            href="/configuracoes/plano"
            className="mt-6 inline-block bg-teal-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-teal-700 transition"
          >
            Ver Planos e Assinar
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Seus dados estão seguros e serão mantidos por 30 dias.
          </p>
        </div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="px-4 py-2 text-sm text-center font-medium bg-amber-100 text-amber-800 border-b border-amber-200">
      <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
      {`Seu teste gratuito expira em ${daysLeft} dia${daysLeft > 1 ? "s" : ""}. `}
      <Link href="/configuracoes/plano" className="underline font-semibold">
        Ver planos
      </Link>
    </div>
  );
}
