"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Search, Filter,
  Activity, Shield, Users, Clock, FileText, Eye, Pencil,
  Trash2, LogIn, LogOut, RefreshCw, BarChart3, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string };
}

interface Stats {
  totalAll: number;
  todayCount: number;
  weekCount: number;
  avgPerDay: number;
  byAction: { action: string; count: number }[];
  byEntity: { entity: string; count: number }[];
  byUser: { name: string; role: string; count: number }[];
}

export default function AuditLogPage() {
  const [entries, setEntries] = React.useState<AuditEntry[]>([]);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [pagination, setPagination] = React.useState({ total: 0, page: 1, pageSize: 50, totalPages: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Filters
  const [filterUser, setFilterUser] = React.useState("");
  const [filterAction, setFilterAction] = React.useState("");
  const [filterEntity, setFilterEntity] = React.useState("");
  const [filterSearch, setFilterSearch] = React.useState("");
  const [filterDateFrom, setFilterDateFrom] = React.useState("");
  const [filterDateTo, setFilterDateTo] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [showStats, setShowStats] = React.useState(true);

  // Filter options from API
  const [filterOptions, setFilterOptions] = React.useState<{
    entities: { name: string; count: number }[];
    users: { id: string; name: string; role: string }[];
    actions: string[];
  }>({ entities: [], users: [], actions: [] });

  const fetchAuditLog = React.useCallback(async (page: number, withStats = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "50");
      if (withStats) params.set("stats", "true");
      if (filterUser) params.set("userId", filterUser);
      if (filterAction) params.set("action", filterAction);
      if (filterEntity) params.set("entity", filterEntity);
      if (filterSearch) params.set("search", filterSearch);
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);

      const res = await fetch(`/api/relatorios/audit?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
        setPagination(data.pagination);
        if (data.filters) setFilterOptions(data.filters);
        if (data.stats) setStats(data.stats);
      } else {
        setError(data.error || "Erro ao carregar audit log");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [filterUser, filterAction, filterEntity, filterSearch, filterDateFrom, filterDateTo]);

  React.useEffect(() => {
    fetchAuditLog(1, true);
  }, [fetchAuditLog]);

  const handleFilter = () => fetchAuditLog(1, true);
  const clearFilters = () => {
    setFilterUser(""); setFilterAction(""); setFilterEntity("");
    setFilterSearch(""); setFilterDateFrom(""); setFilterDateTo("");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch { return dateStr; }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atrás`;
    return formatDate(dateStr);
  };

  const actionConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
    CREATE: { label: "Criar", icon: FileText, color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
    READ: { label: "Visualizar", icon: Eye, color: "text-slate-700 dark:text-slate-400", bgColor: "bg-slate-100 dark:bg-slate-900/30" },
    UPDATE: { label: "Atualizar", icon: Pencil, color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    DELETE: { label: "Excluir", icon: Trash2, color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
    LOGIN: { label: "Login", icon: LogIn, color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
    LOGOUT: { label: "Logout", icon: LogOut, color: "text-gray-700 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
    REACTIVATE: { label: "Reativar", icon: RefreshCw, color: "text-teal-700 dark:text-teal-400", bgColor: "bg-teal-100 dark:bg-teal-900/30" },
    DISCHARGE: { label: "Alta", icon: LogOut, color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
    SIGN: { label: "Assinar", icon: FileText, color: "text-indigo-700 dark:text-indigo-400", bgColor: "bg-indigo-100 dark:bg-indigo-900/30" },
  };

  const entityLabels: Record<string, string> = {
    Paciente: "Paciente",
    Evolucao: "Evolução",
    Prescricao: "Prescrição",
    Agendamento: "Agendamento",
    MovimentacaoFinanceira: "Financeiro",
    Documento: "Documento",
    User: "Usuário",
    Quarto: "Quarto",
    ItemEstoque: "Estoque",
  };

  const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    COORDENADOR: "Coordenador",
    MEDICO: "Médico",
    PSICOLOGO: "Psicólogo",
    ENFERMEIRO: "Enfermeiro",
    TERAPEUTA: "Terapeuta",
    SECRETARIA: "Secretária",
    FINANCEIRO: "Financeiro",
    MONITOR: "Monitor",
    APOIO: "Apoio",
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details) return null;
    const entries = Object.entries(details).filter(([_, v]) => v !== null && v !== undefined);
    if (entries.length === 0) return null;
    return entries;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/configuracoes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Audit Log
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro completo de todas as ações no sistema · {pagination.total} registros
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Stats
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-3.5 w-3.5 mr-1" /> Filtros
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      {/* Stats */}
      {showStats && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{stats.totalAll.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total Registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                <p className="text-2xl font-bold">{stats.todayCount}</p>
                <p className="text-[10px] text-muted-foreground">Hoje</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-2xl font-bold">{stats.weekCount}</p>
                <p className="text-[10px] text-muted-foreground">Últimos 7 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                <p className="text-2xl font-bold">{stats.avgPerDay}</p>
                <p className="text-[10px] text-muted-foreground">Média/dia</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* By Action */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">POR AÇÃO</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-1.5">
                {stats.byAction.map(a => {
                  const config = actionConfig[a.action];
                  return (
                    <div key={a.action} className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${config?.bgColor || "bg-muted"} ${config?.color || ""}`}>
                        {config?.label || a.action}
                      </span>
                      <span className="text-xs text-muted-foreground">{a.count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* By Entity */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">POR MÓDULO</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-1.5">
                {stats.byEntity.slice(0, 8).map(e => (
                  <div key={e.entity} className="flex items-center justify-between">
                    <span className="text-xs">{entityLabels[e.entity] || e.entity}</span>
                    <span className="text-xs text-muted-foreground">{e.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* By User */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">POR USUÁRIO</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-1.5">
                {stats.byUser.slice(0, 8).map((u, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{u.name}</span>
                      <Badge variant="outline" className="text-[8px] py-0">{roleLabels[u.role] || u.role}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{u.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">BUSCA</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">USUÁRIO</label>
                <select
                  value={filterUser}
                  onChange={e => setFilterUser(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">Todos</option>
                  {filterOptions.users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({roleLabels[u.role] || u.role})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">AÇÃO</label>
                <select
                  value={filterAction}
                  onChange={e => setFilterAction(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">Todas</option>
                  {filterOptions.actions.map(a => (
                    <option key={a} value={a}>{actionConfig[a]?.label || a}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">MÓDULO</label>
                <select
                  value={filterEntity}
                  onChange={e => setFilterEntity(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">Todos</option>
                  {filterOptions.entities.map(e => (
                    <option key={e.name} value={e.name}>{entityLabels[e.name] || e.name} ({e.count})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">DE</label>
                <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">ATÉ</label>
                <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleFilter}>
                <Search className="h-3 w-3 mr-1" /> Filtrar
              </Button>
              <Button size="sm" variant="ghost" onClick={clearFilters}>Limpar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Log */}
      <div className="border rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum registro encontrado</div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => {
              const config = actionConfig[entry.action] || { label: entry.action, icon: Activity, color: "text-muted-foreground", bgColor: "bg-muted" };
              const Icon = config.icon;
              const details = formatDetails(entry.details);
              const isExpanded = expandedId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{entry.user.name}</span>
                        <Badge variant="outline" className="text-[9px] py-0">{roleLabels[entry.user.role] || entry.user.role}</Badge>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entityLabels[entry.entity] || entry.entity}
                        </span>
                        {entry.entityId && (
                          <span className="text-[10px] font-mono text-muted-foreground">#{entry.entityId.slice(0, 8)}</span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {describeAction(entry)}
                      </p>

                      {/* Expanded details */}
                      {isExpanded && details && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                          {details.map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2 text-xs">
                              <span className="font-medium text-muted-foreground min-w-[100px]">{formatKey(key)}:</span>
                              <span className="text-foreground break-all">
                                {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                              </span>
                            </div>
                          ))}
                          {entry.ipAddress && (
                            <div className="flex items-start gap-2 text-xs">
                              <span className="font-medium text-muted-foreground min-w-[100px]">IP:</span>
                              <span className="font-mono">{entry.ipAddress}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-2 text-xs">
                            <span className="font-medium text-muted-foreground min-w-[100px]">ID Completo:</span>
                            <span className="font-mono">{entry.entityId || "—"}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs">
                            <span className="font-medium text-muted-foreground min-w-[100px]">Timestamp:</span>
                            <span>{formatDate(entry.createdAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={pagination.page <= 1} onClick={() => fetchAuditLog(pagination.page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2">{pagination.page}/{pagination.totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchAuditLog(pagination.page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: describe action in human-readable format
function describeAction(entry: AuditEntry): string {
  const entity = entry.entity;
  const details = entry.details as any;

  switch (entry.action) {
    case "CREATE":
      if (details?.nome) return `Criou ${entity.toLowerCase()} "${details.nome}"`;
      return `Criou novo registro em ${entity}`;
    case "UPDATE":
      if (details?.fields && Array.isArray(details.fields)) {
        return `Atualizou ${details.fields.length} campo(s): ${details.fields.slice(0, 4).join(", ")}${details.fields.length > 4 ? "..." : ""}`;
      }
      return `Atualizou registro em ${entity}`;
    case "DELETE":
      if (details?.nome) return `Excluiu "${details.nome}" de ${entity}`;
      return `Excluiu registro de ${entity}`;
    case "READ":
      return `Acessou ficha em ${entity}`;
    case "LOGIN":
      return `Fez login no sistema${details?.ip ? ` (IP: ${details.ip})` : ""}`;
    case "LOGOUT":
      return "Encerrou sessão";
    case "REACTIVATE":
      if (details?.diasTratamento) return `Reativou paciente — ${details.diasTratamento} dias de tratamento`;
      return "Reativou paciente";
    case "DISCHARGE":
      if (details?.motivo) return `Deu alta: ${details.motivo}`;
      return "Registrou alta/baixa";
    case "SIGN":
      return "Assinou documento";
    default:
      return `${entry.action} em ${entity}`;
  }
}

// Helper: format key name for display
function formatKey(key: string): string {
  const map: Record<string, string> = {
    nome: "Nome",
    cpf: "CPF",
    fields: "Campos alterados",
    diasTratamento: "Dias tratamento",
    quartoId: "Quarto",
    statusAnterior: "Status anterior",
    motivo: "Motivo",
    observacoes: "Observações",
    ip: "IP",
    userAgent: "Navegador",
  };
  return map[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
}
