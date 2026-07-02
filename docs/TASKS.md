# 📋 Hachi ERP — Task Board

> Cada task é atribuída a um agente principal + supervisor (Reviewer ou Critic).
> Status: ⬜ Pendente | 🟡 Em progresso | ✅ Concluído | 🔴 Bloqueado

---

## 🏗️ FASE 0 — Setup & Infraestrutura

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 0.1 | Instalar dependências e verificar build | 01-Architect | 14-Reviewer | ✅ |
| 0.2 | Configurar ESLint + Prettier | 01-Architect | 14-Reviewer | ✅ |
| 0.3 | Setup Vitest + primeiro teste | 13-Testing | 14-Reviewer | ✅ |
| 0.4 | Configurar CI/CD (GitHub Actions) | 13-Testing | 14-Reviewer | ✅ |
| 0.5 | Docker Compose (PostgreSQL + app) | 01-Architect | 14-Reviewer | ⬜ |

---

## 🗄️ FASE 1 — Banco de Dados & Auth

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 1.1 | Finalizar schema Prisma (validar relações) | 04-Database | 14-Reviewer | ✅ |
| 1.2 | Seed com dados fictícios (pacientes, users) | 04-Database | 13-Testing | ✅ |
| 1.3 | Implementar NextAuth.js (login/register) | 03-Backend | 05-Security | ✅ |
| 1.4 | Middleware RBAC completo | 05-Security | 14-Reviewer | ✅ |
| 1.5 | Serviço de Audit Log | 05-Security | 14-Reviewer | ✅ |
| 1.6 | Criptografia de campos sensíveis | 05-Security | 14-Reviewer | ⬜ |

---

## 🎨 FASE 2 — Design System & Layout

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 2.1 | Instalar componentes shadcn/ui base | 02-Frontend | 15-Critic | ✅ |
| 2.2 | Sidebar responsiva (mobile drawer) | 02-Frontend | 15-Critic | ✅ |
| 2.3 | Header com perfil, notificações, search | 02-Frontend | 15-Critic | ✅ |
| 2.4 | Temas (light/dark toggle) | 02-Frontend | 15-Critic | ✅ |
| 2.5 | Componentes de form reutilizáveis | 02-Frontend | 14-Reviewer | ✅ |
| 2.6 | Data table genérica (TanStack) | 02-Frontend | 14-Reviewer | ⬜ |

---

## 👤 FASE 3 — Módulo Pacientes

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 3.1 | API CRUD pacientes | 03-Backend | 14-Reviewer | ✅ |
| 3.2 | Formulário de cadastro (admissão) | 02-Frontend | 15-Critic | ✅ |
| 3.3 | Listagem com filtros e busca | 02-Frontend | 15-Critic | ✅ |
| 3.4 | Perfil do paciente (detalhes) | 02-Frontend | 07-Clinical | ✅ |
| 3.5 | Cadastro de responsáveis vinculados | 03-Backend + 02-Frontend | 14-Reviewer | ✅ |
| 3.6 | Validações (CPF, data, obrigatórios) | 03-Backend | 13-Testing | ✅ |

---

## 📋 FASE 4 — Prontuário Eletrônico (PEP)

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 4.1 | API evoluções (CRUD + assinatura) | 07-Clinical | 05-Security | ✅ |
| 4.2 | Tela de evolução diária (por tipo) | 07-Clinical + 02-Frontend | 15-Critic | ✅ |
| 4.3 | API prescrições médicas | 07-Clinical | 14-Reviewer | ✅ |
| 4.4 | Tela de prescrições (criar, ativar, desativar) | 02-Frontend | 15-Critic | ✅ |
| 4.5 | Timeline de prontuário (histórico visual) | 02-Frontend | 15-Critic | ✅ |
| 4.6 | Sinais vitais (registro + gráfico) | 07-Clinical + 11-Reports | 14-Reviewer | ⬜ |
| 4.7 | Plano Terapêutico Individual (PTI) | 07-Clinical | 15-Critic | ⬜ |

---

## 📅 FASE 5 — Agenda & Escalas

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 5.1 | API agendamentos (CRUD + conflitos) | 03-Backend | 14-Reviewer | ✅ |
| 5.2 | Calendário visual (dia/semana/mês) | 02-Frontend | 15-Critic | ✅ |
| 5.3 | Notificações de consulta (BotConversa) | 10-Communication | 06-Integrations | ✅ |
| 5.4 | Escalas de funcionários | 09-Admin | 15-Critic | ⬜ |
| 5.5 | Controle de salas | 09-Admin | 14-Reviewer | ⬜ |

---

## 💰 FASE 6 — Financeiro

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 6.1 | API movimentações financeiras | 08-Financial | 14-Reviewer | ✅ |
| 6.2 | Conta corrente por paciente | 08-Financial | 14-Reviewer | ✅ |
| 6.3 | Geração de cobrança Pix | 08-Financial + 06-Integrations | 05-Security | ✅ |
| 6.4 | Webhook de confirmação Pix | 06-Integrations | 05-Security | ✅ |
| 6.5 | Emissão de NFS-e | 08-Financial + 06-Integrations | 14-Reviewer | ✅ |
| 6.6 | Tela de fluxo de caixa | 02-Frontend + 08-Financial | 15-Critic | ✅ |
| 6.7 | Controle de inadimplência + alertas | 08-Financial | 10-Communication | ✅ |
| 6.8 | Relatórios financeiros (DRE) | 11-Reports | 14-Reviewer | ⬜ |

---

## 🏥 FASE 7 — Quartos & Estoque

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 7.1 | API quartos (CRUD + mapa) | 09-Admin | 14-Reviewer | ✅ |
| 7.2 | Mapa visual de ocupação | 02-Frontend + 09-Admin | 15-Critic | ✅ |
| 7.3 | Check-in / check-out de pacientes | 09-Admin | 07-Clinical | ✅ |
| 7.4 | API estoque (CRUD + alertas) | 09-Admin | 14-Reviewer | ✅ |
| 7.5 | Tela de estoque com alertas visuais | 02-Frontend | 15-Critic | ✅ |
| 7.6 | Controle de itens pessoais do paciente | 09-Admin | 14-Reviewer | ⬜ |

---

## 📄 FASE 8 — Documentos

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 8.1 | Migrar lógica do scripts-adm para TypeScript | 12-Documents | 14-Reviewer | ✅ |
| 8.2 | API geração de contrato | 12-Documents | 08-Financial | ✅ |
| 8.3 | API geração de receitas (simples + especial) | 12-Documents | 07-Clinical | ✅ |
| 8.4 | API geração de atestado/declaração | 12-Documents | 07-Clinical | ✅ |
| 8.5 | API geração de recibo | 12-Documents | 08-Financial | ✅ |
| 8.6 | Tela de documentos (listar, gerar, baixar) | 02-Frontend + 12-Documents | 15-Critic | ✅ |
| 8.7 | Templates editáveis (upload de .docx) | 12-Documents | 09-Admin | ⬜ |

---

## 💬 FASE 9 — Comunicação & Portal Família

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 9.1 | Integração BotConversa (envio de msgs) | 10-Communication + 06-Integrations | 05-Security | ✅ |
| 9.2 | Templates de mensagem configuráveis | 10-Communication | 15-Critic | ⬜ |
| 9.3 | Fluxos automáticos (lembrete consulta, cobrança) | 10-Communication | 14-Reviewer | ✅ |
| 9.4 | Portal da família (auth separada) | 10-Communication + 05-Security | 15-Critic | ⬜ |
| 9.5 | Histórico de comunicações por paciente | 10-Communication | 14-Reviewer | ✅ |
| 9.6 | Notificações internas (equipe) | 10-Communication | 02-Frontend | ✅ |

---

## 📊 FASE 10 — Relatórios & BI

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 10.1 | Dashboard executivo (KPIs reais) | 11-Reports | 15-Critic | ✅ |
| 10.2 | Relatório de ocupação por período | 11-Reports | 14-Reviewer | ✅ |
| 10.3 | Relatório clínico (adesão, evoluções) | 11-Reports + 07-Clinical | 14-Reviewer | ✅ |
| 10.4 | Relatório financeiro consolidado | 11-Reports + 08-Financial | 14-Reviewer | ✅ |
| 10.5 | Exportação PDF/Excel | 11-Reports | 12-Documents | ⬜ |
| 10.6 | Relatórios para órgãos públicos (SISNAD) | 11-Reports | 05-Security | ⬜ |

---

## 🔒 FASE 11 — Segurança & Compliance (Contínua)

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 11.1 | 2FA (autenticação dois fatores) | 05-Security | 14-Reviewer | ⬜ |
| 11.2 | Tela de audit log (para ADMIN) | 05-Security + 02-Frontend | 14-Reviewer | ✅ |
| 11.3 | Política de senhas (complexidade, expiração) | 05-Security | 14-Reviewer | ✅ |
| 11.4 | Termos de consentimento LGPD | 05-Security | 15-Critic | ⬜ |
| 11.5 | Backup automatizado + restore | 05-Security + 01-Architect | 14-Reviewer | ⬜ |
| 11.6 | Pentest e hardening | 05-Security | 14-Reviewer | ⬜ |

---

## 🧪 FASE 12 — Testes & Qualidade (Contínua)

| # | Task | Agente | Supervisor | Status |
|---|------|--------|-----------|--------|
| 12.1 | Testes unitários de services | 13-Testing | 14-Reviewer | ✅ |
| 12.2 | Testes de integração (API routes) | 13-Testing | 14-Reviewer | ⬜ |
| 12.3 | Mocks de integrações externas | 13-Testing + 06-Integrations | 14-Reviewer | ⬜ |
| 12.4 | Testes de RBAC (acesso negado) | 13-Testing + 05-Security | 14-Reviewer | ⬜ |
| 12.5 | E2E com Playwright (futuro) | 13-Testing | 15-Critic | ⬜ |
| 12.6 | Cobertura mínima 80% em services | 13-Testing | 14-Reviewer | ⬜ |

---

## 📐 Resumo de Responsabilidades

| Agente | Tasks Atribuídas | Papel |
|--------|:---:|--------|
| 01-Architect | 4 | Infra, decisões técnicas |
| 02-Frontend | 16 | UI/UX, componentes, páginas |
| 03-Backend | 6 | APIs, validações |
| 04-Database | 2 | Schema, seed |
| 05-Security | 10 | Auth, RBAC, compliance |
| 06-Integrations | 5 | APIs externas |
| 07-Clinical | 7 | Prontuário, prescrições |
| 08-Financial | 7 | Financeiro, cobranças |
| 09-Admin | 7 | Quartos, estoque, escalas |
| 10-Communication | 7 | WhatsApp, portal família |
| 11-Reports | 6 | Dashboards, BI |
| 12-Documents | 6 | Geração de docs |
| 13-Testing | 7 | QA, testes |
| 14-Reviewer | **Supervisiona 38 tasks** | Verificador de qualidade |
| 15-Critic | **Supervisiona 22 tasks** | Crítico de UX/produto |

---

## 🎯 Prioridade de Execução

```
FASE 0 (Setup) → FASE 1 (DB/Auth) → FASE 2 (Design) → FASE 3 (Pacientes)
    ↓
FASE 4 (Prontuário) + FASE 5 (Agenda) — em paralelo
    ↓
FASE 6 (Financeiro) + FASE 7 (Quartos) — em paralelo
    ↓
FASE 8 (Documentos) + FASE 9 (Comunicação) — em paralelo
    ↓
FASE 10 (Relatórios) → FASE 11 (Segurança) → FASE 12 (Testes E2E)
```

> **FASES 11 e 12 rodam continuamente** durante todo o desenvolvimento.
