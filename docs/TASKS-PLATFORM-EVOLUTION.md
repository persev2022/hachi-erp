# 📋 Hachi Platform — Tasks de Evolução

> Tarefas para transformar o Hachi Recovery em Hachi Platform (multi-vertical)
> Prioridade: ⬜ Pendente | 🟡 Em progresso | ✅ Concluído

---

## FASE 0 — Consolidar Hachi Recovery (Atual)

| # | Task | Prioridade | Status |
|---|------|-----------|--------|
| 0.1 | Certificado Sicredi → Pix em produção | Alta | ⬜ |
| 0.2 | Migração para OCI Always Free | Alta | ⬜ |
| 0.3 | Feedback loop com CT Persev (2 semanas de uso real) | Alta | ⬜ |
| 0.4 | Corrigir bugs reportados pelo uso real | Alta | ⬜ |
| 0.5 | Landing page finalizada e publicada em domínio próprio | Média | 🟡 |

---

## FASE 1 — Preparação Multi-Tenant

| # | Task | Descrição | Status |
|---|------|-----------|--------|
| 1.1 | Adicionar campo `tenantId` em todas as tabelas | Cada registro pertence a um tenant | ✅ (User) |
| 1.2 | Criar tabela `Tenant` (id, nome, slug, plano, config) | Cadastro de organizações | ✅ |
| 1.3 | Middleware de tenant resolution | Extrair tenant do subdomain ou header | ✅ |
| 1.4 | Filtro automático por tenant em todas as queries Prisma | Prisma middleware ou extension | ✅ (flag off) |
| 1.5 | Seed multi-tenant (CT Persev como primeiro tenant) | Migrar dados existentes | ✅ |
| 1.6 | Testes de isolamento de dados entre tenants | Garantir que tenant A não vê dados de B | ⬜ |

---

## FASE 2 — Abstração de Módulos Verticais

| # | Task | Descrição | Status |
|---|------|-----------|--------|
| 2.1 | Criar sistema de Feature Flags por tenant | Tabela `TenantFeatures` ou config JSON | ✅ |
| 2.2 | Separar código Recovery-specific em `/modules/recovery/` | Evoluções, PTI, SISNAD, Portal Família | ✅ |
| 2.3 | Manter Core genérico em `/lib/` e `/app/` | Financeiro, Agenda, Docs, Auth, RBAC | ✅ |
| 2.4 | Sidebar dinâmica baseada em features do tenant | Menu se adapta à vertical | ✅ |
| 2.5 | Dashboard dinâmico baseado em features | KPIs mudam conforme vertical | ⬜ |
| 2.6 | Documentar API de feature flags | Quais flags existem, quais módulos controlam | ✅ |

---

## FASE 3 — Core Platform (Business OS)

| # | Task | Módulo | Status |
|---|------|--------|--------|
| 3.1 | CRM básico (cadastro, histórico, segmentação) | Novo módulo | ✅ |
| 3.2 | Automação de workflows (gatilhos por status/evento) | Novo módulo | ✅ |
| 3.3 | Cobrança recorrente (billing engine) | Evolução do financeiro | ✅ |
| 3.4 | API pública documentada (OpenAPI/Swagger) | Integradores | ✅ |
| 3.5 | Webhook system (eventos de plataforma) | Para integrações externas | ✅ |
| 3.6 | Sistema de notificações multi-canal | Push, email, WhatsApp, interno | ✅ |
| 3.7 | Painel de admin do tenant (onboarding, config) | Self-service | ✅ |

---

## FASE 4 — Segunda Vertical (Hachi Clinic)

| # | Task | Descrição | Status |
|---|------|-----------|--------|
| 4.1 | Módulo prontuário clínico genérico | Adaptado de Recovery | ⬜ |
| 4.2 | Agenda de profissionais com convênios | Slots por convênio | ⬜ |
| 4.3 | Faturamento TISS (convênios) | Guias, autorizações | ⬜ |
| 4.4 | Módulo de exames e resultados | Upload + visualização | ⬜ |
| 4.5 | Landing page Hachi Clinic | Novo /landing/clinic | ⬜ |
| 4.6 | Feature flags para Clinic | Ativar módulos específicos | ⬜ |
| 4.7 | Primeiro cliente piloto Clinic | Validação real | ⬜ |

---

## FASE 5 — SaaS & Escala

| # | Task | Descrição | Status |
|---|------|-----------|--------|
| 5.1 | Sistema de planos e billing | Stripe/Asaas integration | ⬜ |
| 5.2 | Onboarding self-service (signup → tenant → config) | Zero-touch | ⬜ |
| 5.3 | Marketplace de módulos | Instalar/desinstalar features | ⬜ |
| 5.4 | White-label (branding por tenant) | Logo, cores, domínio | ⬜ |
| 5.5 | Documentação para desenvolvedores | APIs, webhooks, extensões | ⬜ |
| 5.6 | Multi-idioma (i18n) | pt-BR, en, es | ⬜ |

---

## Prioridade de Execução

```
FASE 0 (Consolidar Recovery)
    ↓
FASE 1 (Multi-Tenant) — 2-3 semanas
    ↓
FASE 2 (Feature Flags + Separação de módulos) — 1-2 semanas
    ↓
FASE 3 (Core Platform / Business OS) — contínuo
    ↓
FASE 4 (Segunda Vertical) — quando Core estiver estável
    ↓
FASE 5 (SaaS) — quando tiver 2+ verticais validadas
```

---

## Métricas de Sucesso por Fase

| Fase | Métrica |
|------|---------|
| 0 | CT Persev usando em produção diariamente |
| 1 | 2 tenants rodando na mesma instância com dados isolados |
| 2 | Módulo Recovery desativável sem quebrar o Core |
| 3 | Core serve qualquer vertical sem código específico |
| 4 | Primeiro cliente Clinic em uso real |
| 5 | 10+ tenants, billing automatizado, onboarding < 5min |

---

*Criado: Julho 2026 — Baseado no documento "Evolução Hachi"*
