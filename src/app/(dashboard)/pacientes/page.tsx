"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast-simple";

type StatusPaciente = "Ativo" | "Alta" | "Evadido";

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  status: StatusPaciente;
  dataAdmissao: string;
  quarto: string;
}

const pacientesMock: Paciente[] = [
  { id: "1", nome: "Carlos Eduardo Silva", cpf: "123.456.789-00", status: "Ativo", dataAdmissao: "10/01/2025", quarto: "Q-101" },
  { id: "2", nome: "Marcos Antônio Oliveira", cpf: "234.567.890-11", status: "Ativo", dataAdmissao: "15/02/2025", quarto: "Q-102" },
  { id: "3", nome: "Rafael Souza Lima", cpf: "345.678.901-22", status: "Alta", dataAdmissao: "03/11/2024", quarto: "—" },
  { id: "4", nome: "João Pedro Ferreira", cpf: "456.789.012-33", status: "Ativo", dataAdmissao: "22/03/2025", quarto: "Q-201" },
  { id: "5", nome: "André Luiz Barbosa", cpf: "567.890.123-44", status: "Evadido", dataAdmissao: "08/12/2024", quarto: "—" },
  { id: "6", nome: "Thiago Mendes Costa", cpf: "678.901.234-55", status: "Ativo", dataAdmissao: "01/04/2025", quarto: "Q-103" },
  { id: "7", nome: "Lucas Gabriel Santos", cpf: "789.012.345-66", status: "Ativo", dataAdmissao: "18/04/2025", quarto: "Q-202" },
  { id: "8", nome: "Felipe Augusto Rocha", cpf: "890.123.456-77", status: "Alta", dataAdmissao: "05/09/2024", quarto: "—" },
];

const statusColor: Record<StatusPaciente, string> = {
  Ativo: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Alta: "bg-blue-100 text-blue-700 border-blue-200",
  Evadido: "bg-red-100 text-red-700 border-red-200",
};

export default function PacientesPage() {
  const [busca, setBusca] = React.useState("");
  const { show } = useToast();

  const pacientesFiltrados = pacientesMock.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca)
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os pacientes da clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/pacientes/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      {/* Barra de busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Quarto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientesFiltrados.map((paciente) => (
              <TableRow key={paciente.id}>
                <TableCell className="font-medium">{paciente.nome}</TableCell>
                <TableCell className="text-muted-foreground">
                  {paciente.cpf}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColor[paciente.status]}
                  >
                    {paciente.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {paciente.dataAdmissao}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {paciente.quarto}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver detalhes"
                      onClick={() => show(`Detalhes de ${paciente.nome} — módulo em desenvolvimento`, "info")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() => show(`Editando ${paciente.nome}... (em desenvolvimento)`, "info")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pacientesFiltrados.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
