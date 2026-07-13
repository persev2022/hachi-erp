"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { LOCALES, type Locale } from "@/lib/i18n";

export function LocaleSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="text-xs bg-transparent border-0 text-muted-foreground focus:outline-none cursor-pointer"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
