"use client";

import * as React from "react";
import { Package, AlertTriangle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast-simple";

interface Item {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  minimo: number;
  unidade: string;
  validade: string | null;
  fornecedor: string;
}

const itensMock: Item[] = [
  { id: "1", nome: "Clonazepam 2mg", categoria: "Medicamento", quantidade: 8, minimo: 20, unidade: "Cx", validade: "2027-03", fornecedor: "Distribuidora Pharma" },
  { id: "2", nome: "Sertralina 50mg", categoria: "Medicamento", quantidade: 45, minimo: 20, unidade: "Cx", validade: "2027-06", fornecedor: "Distribuidora Pharma" },
  { id: "3", nome: "Haloperidol 5mg", categoria: "Medicamento", quantidade: 30, minimo: 10, unidade: "Cx", validade: "2026-12", fornecedor: "Distribuidora Pharma" },
  { id: "4", nome: "Luvas Procedimento M", categoria: "Material Hospitalar", quantidade: 12, minimo: 10, unidade: "Cx", validade: "2028-01", fornecedor: "MedSupply" },
  { id: "5", nome: "Álcool 70%", categoria: "Higiene", quantidade: 3, minimo: 5, unidade: "L", validade: "2027-08", fornecedor: "CleanMax" },
  { id: "6", nome: "Papel Toalha", categoria: "Higiene", quantidade: 48, minimo: 20, unidade: "Pct", validade: null, fornecedor: "CleanMax" },
  { id: "7", nome: "Lençol Solteiro", categoria: "Roupa de Cama", quantidade: 32, minimo: 15, unidade: "Un", validade: null, fornecedor: "Têxtil Conforto" },
  { id: "8", nome: "Detergente Neutro", categoria: "Limpeza", quantidade: 6, minimo: 8, unidade: "L", validade: null, fornecedor: "CleanMax" },
  { id: "9", nome: "Dipirona 500mg", categoria: "Medicamento", quantidade: 60, minimo: 30, unidade: "Cx", validade: "2027-09", fornecedor: "Distribuidora Pharma" },
  { id: "10", nome: "Agulha Descartável", categoria: "Material Hospitalar", quantidade: 200, minimo: 50, unidade: "Un", validade: "2028-05", fornecedor: "MedSupply" },
];

export default function EstoquePage() {
  const [busca, setBusca] = React.useState("");
  const { show } = useToast();
  const alertas = itensMock.filter((i) => i.quantidade <= i.minimo);

  const filtrados = itensMock.filter((i) =>
    i.nome.toLowerCase().includes(busca.toLowerCase()) ||
    i.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de medicamentos e materiais</p>
        </div>
        <Button onClick={() => show("Cadastro de item em desenvolvimento", "info")}>
          <Plus className="h-4 w-4 mr-2" />Novo Item
        </Button>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-800 text-sm">
              {alertas.length} item(ns) abaixo do estoque mínimo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertas.map((item) => (
              <Badge key={item.id} variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                {item.nome} ({item.quantidade}/{item.minimo} {item.unidade})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou categoria..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((item) => {
              const baixo = item.quantidade <= item.minimo;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{item.categoria}</TableCell>
                  <TableCell className={baixo ? "text-red-600 font-bold" : ""}>
                    {item.quantidade} {item.unidade}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.minimo} {item.unidade}</TableCell>
                  <TableCell className="text-muted-foreground">{item.validade || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{item.fornecedor}</TableCell>
                  <TableCell>
                    {baixo ? (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Baixo</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
