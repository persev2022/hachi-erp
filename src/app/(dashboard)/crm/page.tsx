"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Patient {
  id: string;
  nome: string;
  dataAdmissao?: string;
  dataAlta?: string;
  updatedAt?: string;
  telefone?: string | null;
}

interface Column {
  key: string;
  label: string;
  color: string;
  count: number;
  patients: Patient[];
}

export default function CRMPage() {
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [terminology, setTerminology] = React.useState<Record<string, string> | null>(null);

  React.useEffect(() => {
    fetch("/api/platform/terminology")
      .then((r) => r.json())
      .then((d) => { if (d.success) setTerminology(d.terminology); })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    fetch("/api/crm")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const f = d.data.funnel;
          setColumns([
            { key: "ATIVO", label: "Ativos", color: "bg-emerald-500", count: f.ATIVO.count, patients: f.ATIVO.patients },
            { key: "ALTA", label: "Alta", color: "bg-blue-500", count: f.ALTA.count, patients: f.ALTA.patients },
            { key: "EVADIDO", label: "Evadidos", color: "bg-red-500", count: f.EVADIDO.count, patients: f.EVADIDO.patients },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const title = terminology?.paciente ? `CRM — ${terminology.paciente}s` : "CRM — Pipeline";

  function formatDate(d?: string | null) {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return null; }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão Kanban do funil de {terminology?.paciente || "pacientes"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${col.color}`} />
              <h2 className="font-semibold text-sm">{col.label}</h2>
              <span className="ml-auto text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                {col.count}
              </span>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {col.patients.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro</p>
              ) : (
                col.patients.map((p) => {
                  const date = formatDate(p.dataAdmissao || p.dataAlta || p.updatedAt);
                  return (
                    <Link key={p.id} href={`/pacientes/${p.id}`}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate">{p.nome}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {date && <span>{date}</span>}
                            {p.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />{p.telefone}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
