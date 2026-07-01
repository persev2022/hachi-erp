"use client";

import * as React from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Movimentacao {
  id: string;
  data: string;
  paciente: string;
  descricao: string;
  tipo: "receita" | "despesa";
  valor: number;
  status: "Pago" | "Pendente" | "Atrasado";
}

const movimentacoesMock: Movimentacao[] = [
  { id: "1", data: "01/07/2026", paciente: "Carlos Eduardo Silva", descricao: "Mensalidade Julho", tipo: "receita", valor: 2000, status: "Pago" },
  { id: "2", data: "01/07/2026", paciente: "Marcos Antônio Oliveira", descricao: "Mensalidade Julho", tipo: "receita", valor: 2000, status: "Pendente" },
  { id: "3", data: "28/06/2026", paciente: "João Pedro Ferreira", descricao: "Matrícula", tipo: "receita", valor: 1800, status: "Pago" },
  { id: "4", data: "25/06/2026", paciente: "—", descricao: "Farmácia (Clonazepam, Sertralina)", tipo: "despesa", valor: 450, status: "Pago" },
  { id: "5", data: "20/06/2026", paciente: "Thiago Mendes Costa", descricao: "Mensalidade Junho", tipo: "receita", valor: 2000, status: "Atrasado" },
  { id: "6", data: "20/06/2026", paciente: "Lucas Gabriel Santos", descricao: "Mensalidade Junho", tipo: "receita", valor: 2000, status: "Pago" },
  { id: "7", data: "18/06/2026", paciente: "—", descricao: "Salários (Equipe Clínica)", tipo: "despesa", valor: 28000, status: "Pago" },
  { id: "8", data: "15/06/2026", paciente: "—", descricao: "Alimentação e Suprimentos", tipo: "despesa", valor: 3200, status: "Pago" },
];

const statusStyles: Record<string, string> = {
  Pago: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pendente: "bg-amber-100 text-amber-700 border-amber-200",
  Atrasado: "bg-red-100 text-red-700 border-red-200",
};

export default function FinanceiroPage() {
  const totalReceitas = movimentacoesMock
    .filter((m) => m.tipo === "receita" && m.status === "Pago")
    .reduce((acc, m) => acc + m.valor, 0);
  const totalDespesas = movimentacoesMock
    .filter((m) => m.tipo === "despesa")
    .reduce((acc, m) => acc + m.valor, 0);
  const inadimplentes = movimentacoesMock.filter((m) => m.status === "Atrasado").length;
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle financeiro e faturamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Gerar Pix</Button>
          <Button variant="outline">Emitir NF-e</Button>
          <Button>Nova Movimentação</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receitas (mês)</p>
              <p className="text-2xl font-bold text-emerald-600">
                R$ {totalReceitas.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Despesas (mês)</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalDespesas.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                R$ {saldo.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inadimplentes</p>
              <p className="text-2xl font-bold text-amber-600">{inadimplentes}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de movimentações */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Movimentações Recentes</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoesMock.map((mov) => (
              <TableRow key={mov.id}>
                <TableCell className="text-muted-foreground">{mov.data}</TableCell>
                <TableCell className="font-medium">{mov.paciente}</TableCell>
                <TableCell>{mov.descricao}</TableCell>
                <TableCell>
                  {mov.tipo === "receita" ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm">
                      <TrendingUp className="h-3 w-3" /> Receita
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 text-sm">
                      <TrendingDown className="h-3 w-3" /> Despesa
                    </span>
                  )}
                </TableCell>
                <TableCell className={`font-medium ${mov.tipo === "receita" ? "text-emerald-600" : "text-red-600"}`}>
                  {mov.tipo === "receita" ? "+" : "-"} R$ {mov.valor.toLocaleString("pt-BR")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[mov.status]}>
                    {mov.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
