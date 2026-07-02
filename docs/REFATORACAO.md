# 🧹 Hachi ERP — Análise de Dead Code & Plano de Refatoração

> Auditoria realizada em 02/07/2026. Lista código morto e tarefas de limpeza.

---

## 🔴 Código Morto Identificado

### 1. Diretórios Vazios (scaffolded mas nunca implementados)

| Caminho | Propósito original | Ação |
|---------|-------------------|------|
| `src/app/(portal-familia)/` | Portal da família | ⬜ Remover até implementação futura |
| `src/app/api/integracoes/pix/` | Integração Pix | ⬜ Remover até implementação futura |
| `src/app/api/integracoes/nfe/` | Integração NF-e | ⬜ Remover até implementação futura |
| `src/app/(auth)/register/` | Página de registro | ⬜ Remover (registro é via admin) |
| `src/components/tables/` | Componente table genérico | ⬜ Remover (já usa shadcn Table) |
| `src/components/forms/` | Componente form genérico | ⬜ Remover (usa form nativo + zod) |
| `src/components/charts/` | Componentes de gráfico | ⬜ Remover até usar Recharts |
| `src/lib/hooks/` | Hooks customizados | ⬜ Remover (vazio) |
| `src/lib/validators/` | Validadores Zod centralizados | ⬜ Remover (validação inline nas routes) |

### 2. Funções Exportadas Nunca Utilizadas

| Arquivo | Função | Motivo | Ação |
|---------|--------|--------|------|
| `src/lib/documents/generator.ts` | `getAvailableTemplates()` | Exportada mas nenhum consumer | Manter (útil para futura API `/api/documentos/templates`) |
| `src/lib/integrations/botconversa/client.ts` | `buscarContato()` | Nunca chamada | Manter (será usada no portal família) |
| `src/lib/integrations/botconversa/client.ts` | `listarFluxos()` | Nunca chamada | Manter (será usada em templates de msg) |

### 3. Arquivo de Tipos Nunca Importado

| Arquivo | Problema | Ação |
|---------|----------|------|
| `src/types/index.ts` | Define `ApiResponse`, `PaginatedResponse`, `SessionUser`, `ListParams` — nenhum é importado em nenhum arquivo | Integrar nos componentes ou remover |

### 4. Comentários de Código (análise)

Todos os comentários encontrados são **explicativos/documentacionais** (ex: `// GET: Dashboard KPIs`, `// Check if token was blacklisted`). **Nenhum código comentado** foi encontrado (ex: linhas de código desabilitadas com `//`). ✅ Limpo.

### 5. Imports Não Utilizados

Após análise, **nenhum import não utilizado** foi detectado. O build do TypeScript já elimina imports não usados em tempo de compilação. ✅ Limpo.

### 6. Variáveis de Estado Sem Uso

Nenhuma variável `useState` declarada sem uso ou leitura detectada. ✅ Limpo.

---

## 📋 Tarefas de Refatoração

### TASK R1 — Limpar Diretórios Vazios
**Prioridade:** Baixa (cosmético)
**Impacto:** Clareza do projeto

- [ ] R1.1 — Remover `src/app/(portal-familia)/`
- [ ] R1.2 — Remover `src/app/(auth)/register/`
- [ ] R1.3 — Remover `src/app/api/integracoes/pix/`
- [ ] R1.4 — Remover `src/app/api/integracoes/nfe/`
- [ ] R1.5 — Remover `src/components/tables/`
- [ ] R1.6 — Remover `src/components/forms/`
- [ ] R1.7 — Remover `src/components/charts/`
- [ ] R1.8 — Remover `src/lib/hooks/`
- [ ] R1.9 — Remover `src/lib/validators/`

---

### TASK R2 — Integrar Tipos Globais
**Prioridade:** Média (DX)
**Impacto:** Consistência de tipagem

- [ ] R2.1 — Usar `ApiResponse<T>` de `src/types/index.ts` nos retornos de API (em vez de `{ success: true, data }` inline)
- [ ] R2.2 — Usar `PaginatedResponse<T>` nas listagens paginadas
- [ ] R2.3 — Usar `SessionUser` no tipo do contexto de auth
- [ ] R2.4 — Ou remover `src/types/index.ts` se decidir manter tipagem inline

---

### TASK R3 — Extrair Validações Zod para Módulo Centralizado
**Prioridade:** Média (manutenibilidade)
**Impacto:** DRY, facilita testes unitários

- [ ] R3.1 — Criar `src/lib/validators/paciente.ts` (extrair do `/api/pacientes/route.ts`)
- [ ] R3.2 — Criar `src/lib/validators/evolucao.ts`
- [ ] R3.3 — Criar `src/lib/validators/prescricao.ts`
- [ ] R3.4 — Criar `src/lib/validators/agendamento.ts`
- [ ] R3.5 — Criar `src/lib/validators/financeiro.ts`
- [ ] R3.6 — Criar `src/lib/validators/user.ts`

---

### TASK R4 — Extrair Lógica de Negócio para Services
**Prioridade:** Alta (arquitetura)
**Impacto:** Testabilidade, separação de concerns

- [ ] R4.1 — Criar `src/lib/services/pacientes.ts` (CRUD logic extraída da route)
- [ ] R4.2 — Criar `src/lib/services/prontuario.ts` (evoluções + prescrições)
- [ ] R4.3 — Criar `src/lib/services/agenda.ts` (check conflitos, transições)
- [ ] R4.4 — Criar `src/lib/services/financeiro.ts` (cálculos, totais)
- [ ] R4.5 — Criar `src/lib/services/estoque.ts` (alertas, movimentação)
- [ ] R4.6 — Manter API routes como thin wrappers (parse → validate → call service → respond)

---

### TASK R5 — Componentizar Formulários Repetitivos
**Prioridade:** Média (DRY)
**Impacto:** Reduz duplicação entre modais

- [ ] R5.1 — Criar `<FormModal>` genérico (título, onSubmit, onCancel, loading state)
- [ ] R5.2 — Criar `<SelectPaciente>` (selector reutilizável com fetch)
- [ ] R5.3 — Criar `<SelectProfissional>` (selector reutilizável com fetch)
- [ ] R5.4 — Criar `<FormField>` wrapper (label + input + error)

---

### TASK R6 — Hooks Customizados
**Prioridade:** Média (DX)
**Impacto:** Reduz lógica repetida em páginas

- [ ] R6.1 — Criar `useAuth()` hook (busca /api/auth/me, retorna user + loading)
- [ ] R6.2 — Criar `usePacientes()` hook (fetch lista para selectors)
- [ ] R6.3 — Criar `useProfissionais()` hook (fetch lista para selectors)
- [ ] R6.4 — Criar `useFetch<T>()` hook genérico (loading, error, data, refetch)

---

### TASK R7 — Padronizar Respostas de API
**Prioridade:** Baixa (consistência)
**Impacto:** Contratos de API previsíveis

- [ ] R7.1 — Criar helper `apiSuccess(data, status?)` e `apiError(msg, status)`
- [ ] R7.2 — Substituir `NextResponse.json({ success: true, ... })` por helpers em todas routes
- [ ] R7.3 — Documentar o contrato de resposta no README

---

### TASK R8 — Configurar ESLint + Prettier
**Prioridade:** Alta (qualidade)
**Impacto:** Estilo consistente, catch erros early

- [ ] R8.1 — Instalar eslint + @typescript-eslint + prettier
- [ ] R8.2 — Configurar regras: no-unused-vars (error), no-console (warn em prod)
- [ ] R8.3 — Configurar Prettier (semi, singleQuote, trailingComma)
- [ ] R8.4 — Rodar lint em todos os arquivos e corrigir issues
- [ ] R8.5 — Adicionar script `"lint": "eslint src/"` ao package.json

---

## 📐 Prioridade de Execução

```
1. R8 (ESLint) ← catch issues automaticamente daqui em diante
2. R1 (Limpar dirs) ← 2 min, cosmético
3. R4 (Services) ← maior impacto na arquitetura
4. R3 (Validators) ← necessário para testes
5. R6 (Hooks) ← reduz duplicação no frontend
6. R5 (Componentes) ← QoL
7. R7 (API helpers) ← padronização
8. R2 (Tipos) ← opcional, pode integrar durante R4
```

---

## ✅ O que já está limpo

- Nenhum import não utilizado
- Nenhuma variável de estado sem leitura
- Nenhum código comentado (apenas comentários documentacionais)
- Todas as relações Prisma com `select` explícito (sem leak de dados)
- Build TypeScript passa com 0 erros
- Nenhum `$queryRaw` (SQL injection impossível)
