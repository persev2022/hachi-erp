"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * The standalone "Análise Profunda" page has been merged into the unified
 * Central Financeira at /financeiro/dashboard. This redirects for compatibility.
 */
export default function AnaliseRedirect() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/financeiro/dashboard");
  }, [router]);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Redirecionando para a Central Financeira...</p>
    </div>
  );
}
