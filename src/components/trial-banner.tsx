"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function TrialBanner() {
  const [show, setShow] = React.useState(false);
  const [daysLeft, setDaysLeft] = React.useState(0);

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
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  return (
    <div
      className={`px-4 py-2 text-sm text-center font-medium ${
        daysLeft <= 0
          ? "bg-red-500 text-white"
          : "bg-amber-100 text-amber-800 border-b border-amber-200"
      }`}
    >
      <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
      {daysLeft <= 0
        ? "Seu período de teste expirou. "
        : `Seu teste gratuito expira em ${daysLeft} dia${daysLeft > 1 ? "s" : ""}. `}
      <Link href="/configuracoes/plano" className="underline font-semibold">
        Ver planos
      </Link>
    </div>
  );
}
