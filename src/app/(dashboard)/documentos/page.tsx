"use client";

import * as React from "react";
import { FileText, Download, Eye, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast-simple";

interface Documento {
  id: string;
  tipo: string;
  titulo: string;
  paciente: string;
  geradoPor: string;
  data: string;
  formato: string;
  assinado: boolean;
}

const documentosMock: Documento[] = [
  { id: "1", tipo: "Contrato", titulo: "Contrato de Internação", paciente: "João Pedro Ferreira", geradoPor: "Secretaria", data: "22/03/2026", formato: "PDF", assinado: true },
  { id: "2", tipo: "Receita Especial", titulo: "Receituário Especial - Clonazepam", paciente: "Carlos Eduardo Silva", geradoPor: "Dr. Marcos Vieira", data: "28/06/2026", formato: "PDF", assinado: true },
  { id: "3", tipo: "Atestado", titulo: "Atestado Médico e Declaração", paciente: "Marcos Antônio Oliveira", geradoPor: "Dr. Marcos Vieira", data: "25/06/2026", formato: "DOCX", assinado: false },
  { id: "4", tipo: "Recibo", titulo: "Recibo - Matrícula", paciente: "João Pedro Ferreira", geradoPor: "Financeiro", data: "22/03/2026", formato: "PDF", assinado: false },
  { id: "5", tipo: "PTI", titulo: "Plano Terapêutico Individual", paciente: "Thiago Mendes Costa", geradoPor: "Dra. Ana Paula", data: "05/04/2026", formato: "PDF", assinado: true },
  { id: "6", tipo: "Receita Simples", titulo: "Receituário Simples - Dipirona, Sertralina", paciente: "Lucas Gabriel Santos", geradoPor: "Dr. Marcos Vieira", data: "30/06/2026", formato: "PDF", assinado: true },
  { id: "7", tipo: "Relatório Médico", titulo: "Relatório de Evolução Mensal", paciente: "Carlos Eduardo Silva", geradoPor: "Dr. Marcos Vieira", data: "01/07/2026", formato: "PDF", assinado: true },
  { id: "8", tipo: "Contrato", titulo: "Contrato de Internação", paciente: "Lucas Gabriel Santos", geradoPor: "Secretaria", data: "18/04/2026", formato: "PDF", assinado: true },
];

const tipoColors: Record<string, string> = {
  Contrato: "bg-blue-100 text-blue-700 border-blue-200",
  "Receita Especial": "bg-purple-100 text-purple-700 border-purple-200",
  "Receita Simples": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Atestado: "bg-amber-100 text-amber-700 border-amber-200",
  Recibo: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PTI: "bg-pink-100 text-pink-700 border-pink-200",
  "Relatório Médico": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export default function DocumentosPage() {
  const { show } = useToast();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Geração e gerenciamento de documentos clínicos e administrativos</p>
        </div>
        <Button onClick={() => show("Selecione o tipo de documento", "info")}>
          <Plus className="h-4 w-4 mr-2" />Gerar Documento
        </Button>
      </div>

      {/* Atalhos de geração rápida */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {["Contrato", "Receita Simples", "Receita Especial", "Atestado", "Recibo", "PTI", "Relatório"].map((tipo) => (
          <Button
            key={tipo}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => show(`Gerando ${tipo}... (em desenvolvimento)`, "info")}
          >
            <FileText className="h-3 w-3 mr-1" />
            {tipo}
          </Button>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Documentos Recentes</h2>
          <Button variant="ghost" size="sm" onClick={() => show("Filtros em desenvolvimento", "info")}>
            <Filter className="h-3 w-3 mr-1" />Filtrar
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Gerado por</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Assinado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentosMock.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Badge variant="outline" className={tipoColors[doc.tipo] || ""}>
                    {doc.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{doc.titulo}</TableCell>
                <TableCell>{doc.paciente}</TableCell>
                <TableCell className="text-muted-foreground">{doc.geradoPor}</TableCell>
                <TableCell className="text-muted-foreground">{doc.data}</TableCell>
                <TableCell>
                  {doc.assinado ? (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Sim</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar"
                      onClick={() => show(`Visualizando "${doc.titulo}"...`, "info")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download"
                      onClick={() => show(`Baixando "${doc.titulo}"...`, "success")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
