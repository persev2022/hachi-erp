"use client";

import * as React from "react";
import { BarChart3, TrendingUp, Users, BedDouble, DollarSign, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface KPI {
  label: string;
  valor: string;
  variacao: string;
  positivo: boolean;
  icon: React.ElementType;
}

const kpis: KPI[] = [
  { label: "Permanência Média", valor: "78 dias", variacao: "+3 dias", positivo: false, icon: Calendar },
  { label: "Taxa de Ocupação", valor: "80%", variacao: "+5%", positivo: true, icon: BedDouble },
  { label: "Taxa de Adesão", valor: "92%", variacao: "+2%", positivo: true, icon: TrendingUp },
  { label: "Pacientes em Tratamento", valor: "24", variacao: "+2", positivo: true, icon: Users },
  { label: "Receita Mensal", valor: "R$ 156.000", variacao: "+8%", positivo: true, icon: DollarSign },
  { label: "Inadimplência", valor: "4.2%", variacao: "-1.3%", positivo: true, icon: BarChart3 },
];

interface Relatorio {
  nome: string;
  descricao: string;
  categoria: string;
  ultimaGeracao: string;
}

const relatoriosDisponiveis: Relatorio[] = [
  { nome: "Relatório de Ocupação", descricao: "Taxa de ocupação por quarto e período", categoria: "Operacional", ultimaGeracao: "01/07/2026" },
  { nome: "DRE Mensal", descricao: "Demonstrativo de Resultado do Exercício", categoria: "Financeiro", ultimaGeracao: "30/06/2026" },
  { nome: "Fluxo de Caixa", descricao: "Entradas e saídas por categoria", categoria: "Financeiro", ultimaGeracao: "30/06/2026" },
  { nome: "Evolução Clínica", descricao: "Adesão ao tratamento e evoluções registradas", categoria: "Clínico", ultimaGeracao: "28/06/2026" },
  { nome: "Relatório SISNAD", descricao: "Dados para o Sistema Nacional de Drogas", categoria: "Compliance", ultimaGeracao: "15/06/2026" },
  { nome: "Consumo de Medicamentos", descricao: "Utilização e gasto farmacêutico", categoria: "Estoque", ultimaGeracao: "30/06/2026" },
  { nome: "Produtividade Profissional", descricao: "Atendimentos por profissional", categoria: "Operacional", ultimaGeracao: "30/06/2026" },
  { nome: "Faturamento por Paciente", descricao: "Receita individualizada e inadimplência", categoria: "Financeiro", ultimaGeracao: "30/06/2026" },
];

const catColors: Record<string, string> = {
  Operacional: "bg-blue-100 text-blue-700 border-blue-200",
  Financeiro: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Clínico: "bg-purple-100 text-purple-700 border-purple-200",
  Compliance: "bg-amber-100 text-amber-700 border-amber-200",
  Estoque: "bg-pink-100 text-pink-700 border-pink-200",
};

export default function RelatoriosPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios & BI</h1>
        <p className="text-sm text-muted-foreground mt-1">Indicadores de performance e relatórios gerenciais</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.valor}</p>
                <p className={`text-xs mt-1 ${kpi.positivo ? "text-emerald-600" : "text-red-600"}`}>
                  {kpi.variacao} vs mês anterior
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico placeholder */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="font-semibold mb-4">Receita vs Despesa (últimos 6 meses)</h2>
        <div className="h-48 flex items-end justify-between gap-2 px-4">
          {[
            { mes: "Jan", rec: 140, desp: 95 },
            { mes: "Fev", rec: 135, desp: 92 },
            { mes: "Mar", rec: 148, desp: 98 },
            { mes: "Abr", rec: 152, desp: 100 },
            { mes: "Mai", rec: 150, desp: 96 },
            { mes: "Jun", rec: 156, desp: 102 },
          ].map((d) => (
            <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1 h-36">
                <div className="flex-1 bg-emerald-400 rounded-t" style={{ height: `${(d.rec / 160) * 100}%` }} title={`R$${d.rec}k`} />
                <div className="flex-1 bg-red-300 rounded-t" style={{ height: `${(d.desp / 160) * 100}%` }} title={`R$${d.desp}k`} />
              </div>
              <span className="text-xs text-muted-foreground">{d.mes}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-emerald-400" /><span className="text-xs text-muted-foreground">Receita</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-red-300" /><span className="text-xs text-muted-foreground">Despesa</span></div>
        </div>
      </div>

      {/* Relatórios disponíveis */}
      <div>
        <h2 className="font-semibold mb-3">Relatórios Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {relatoriosDisponiveis.map((rel) => (
            <div key={rel.nome} className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{rel.nome}</p>
                  <Badge variant="outline" className={catColors[rel.categoria]}>{rel.categoria}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{rel.descricao}</p>
                <p className="text-xs text-muted-foreground mt-1">Última geração: {rel.ultimaGeracao}</p>
              </div>
              <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" />Gerar</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
