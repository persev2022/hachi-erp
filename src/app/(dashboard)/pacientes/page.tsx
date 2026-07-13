"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, Eye, Pencil, Loader2 } from "lucide-react";
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
import { useTerminology } from "@/hooks/use-terminology";
import { EmptyState } from "@/components/empty-state";


type StatusPaciente = "ATIVO" | "ALTA" | "EVADIDO" | "TRANSFERIDO" | "OBITO";

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  status: StatusPaciente;
  dataAdmissao: string;
  quarto: { numero: string } | null;
}

interface PacientesResponse {
  success: boolean;
  data: Paciente[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

const statusLabel: Record<StatusPaciente, string> = {
  ATIVO: "Ativo",
  ALTA: "Alta",
  EVADIDO: "Evadido",
  TRANSFERIDO: "Transferido",
  OBITO: "Óbito",
};

const statusColor: Record<StatusPaciente, string> = {
  ATIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ALTA: "bg-blue-100 text-blue-700 border-blue-200",
  EVADIDO: "bg-red-100 text-red-700 border-red-200",
  TRANSFERIDO: "bg-amber-100 text-amber-700 border-amber-200",
  OBITO: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function formatCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return cpf;
}

export default function PacientesPage() {
  const terms = useTerminology();
  const [busca, setBusca] = React.useState("");
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchPacientes = React.useCallback(async (search: string, page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("pageSize", "20");

      const res = await fetch(`/api/pacientes?${params.toString()}`);
      const data: PacientesResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Erro ao carregar pacientes");
        return;
      }

      setPacientes(data.data);
      setPagination(data.pagination);
    } catch {
      setError("Erro de conexão ao buscar pacientes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  React.useEffect(() => {
    fetchPacientes("");
  }, [fetchPacientes]);

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchPacientes(busca);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busca, fetchPacientes]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{terms.pacientes}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {`Gerencie os ${terms.pacientes.toLowerCase()}`}
            {pagination.total > 0 && (
              <span className="ml-2">· {pagination.total} cadastrados</span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/pacientes/novo">
            <Plus className="h-4 w-4 mr-2" />
            {terms.novoPaciente}
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

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
          {error}
          <Button
            variant="link"
            className="ml-2 text-destructive underline p-0 h-auto"
            onClick={() => fetchPacientes(busca)}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando pacientes...</span>
        </div>
      )}

      {/* Tabela */}
      {!loading && !error && (
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
              {pacientes.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">{paciente.nome}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCpf(paciente.cpf)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColor[paciente.status]}
                    >
                      {statusLabel[paciente.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(paciente.dataAdmissao)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {paciente.quarto?.numero || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ver detalhes"
                        asChild
                      >
                        <Link href={`/pacientes/${paciente.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        asChild
                      >
                        <Link href={`/pacientes/${paciente.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pacientes.length === 0 && !busca && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState module="pacientes" />
                  </TableCell>
                </TableRow>
              )}
              {pacientes.length === 0 && busca && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhum resultado para &quot;{busca}&quot;
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchPacientes(busca, pagination.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchPacientes(busca, pagination.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
