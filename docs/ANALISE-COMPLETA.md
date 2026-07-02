# 📋 Hachi ERP — Análise Completa: O Que Falta Para 100%

> Documento gerado em 01/07/2026 após análise exaustiva do estado atual do projeto.
> Objetivo: detalhar ABSOLUTAMENTE TUDO que precisa ser implementado para o sistema estar pronto para uso real em produção.

---

## 📊 Estado Atual

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| Frontend (UI) | 🟢 90% | Todas as páginas conectadas a APIs reais, formulários funcionais |
| Backend (API) | 🟢 85% | 22 API routes implementadas, CRUD completo para todos os módulos |
| Banco de Dados | 🟢 100% | Schema Prisma completo (12 models), seed com dados iniciais |
| Autenticação | 🟢 100% | JWT custom com jose + bcrypt, cookie httpOnly, middleware |
| RBAC (Permissões) | 🟡 60% | Middleware funcional, RBAC parcial nas APIs (financeiro, prescrições) |
| Integrações | 🟡 40% | BotConversa implementado, Pix e NF-e pendentes |
| Testes | 🔴 0% | Nenhum teste existe |
| Mobile/Responsividade | 🟢 90% | Sidebar drawer, layouts responsivos em todas as páginas |
| Acessibilidade | 🟡 40% | Componentes shadcn acessíveis, faltam aria-labels customizados |
| Geração de Documentos | 🟢 90% | 5 templates portados do scripts-adm, API funcional |
| Deploy | 🟢 100% | Vercel + GitHub funcionando |

---

## 🔴 CRÍTICO — Sem isso não funciona

### 1. BANCO DE DADOS (Neon PostgreSQL)

**O que falta:**
- [ ] Criar conta no Neon (https://neon.tech) e projeto `hachi-erp`
- [ ] Obter connection string e configurar em `.env` e Vercel env vars
- [ ] Reinstalar `@prisma/client` e `prisma` no package.json
- [ ] Rodar `prisma db push` para criar as tabelas
- [ ] Criar seed com dados iniciais (admin user, quartos, etc)
- [ ] Mudar `output: "export"` para deploy SSR na Vercel (necessário para API routes)

**Impacto:** Sem banco, NADA funciona de verdade. Todos os dados são mockados.

---

### 2. AUTENTICAÇÃO & SESSÕES

**O que falta:**
- [ ] Instalar `next-auth` ou implementar auth custom com JWT
- [ ] Página de login com validação real (email + senha vs banco)
- [ ] Página de registro (para criar primeiro admin)
- [ ] Hash de senhas com bcrypt
- [ ] Sessões com token JWT (cookie httpOnly)
- [ ] Middleware de verificação em todas as rotas protegidas
- [ ] Expiração de sessão (timeout configurável)
- [ ] Logout real (invalidar sessão)
- [ ] Tela de "Esqueci minha senha"

**Impacto:** Qualquer pessoa acessa qualquer coisa sem autenticação.

---

### 3. RBAC — CONTROLE DE ACESSO POR PERFIL

**O que falta:**
- [ ] Middleware que verifica role do usuário em cada rota
- [ ] Mapear permissões: quem vê o quê
  - ADMIN: tudo
  - MEDICO: prontuário + prescrições + agenda
  - PSICOLOGO: prontuário (psicológico) + agenda
  - ENFERMEIRO: prontuário (enfermagem) + sinais vitais + medicação
  - SECRETARIA: pacientes (cadastro) + agenda + documentos
  - FINANCEIRO: financeiro + documentos (recibos/NF-e)
  - MONITOR: quartos + escalas
- [ ] UI condicional (esconder itens da sidebar por perfil)
- [ ] API routes protegidas por role
- [ ] Dados clínicos 100% isolados de dados administrativos

**Impacto:** Secretária vê diagnósticos, violação de LGPD/CFM.

---

### 4. API ROUTES (Backend)

**O que falta — TODAS as pastas em `src/app/api/` estão VAZIAS:**

#### `/api/auth/`
- [ ] POST `/login` — autenticar usuário
- [ ] POST `/register` — criar usuário (protegido por admin)
- [ ] POST `/logout` — invalidar sessão
- [ ] GET `/me` — retornar usuário atual

#### `/api/pacientes/`
- [ ] GET `/` — listar pacientes (com paginação, filtros, busca)
- [ ] GET `/[id]` — detalhe de um paciente
- [ ] POST `/` — criar paciente (admissão)
- [ ] PUT `/[id]` — atualizar paciente
- [ ] DELETE `/[id]` — soft delete
- [ ] GET `/[id]/historico` — timeline completa do paciente

#### `/api/prontuario/`
- [ ] GET `/evolucoes?pacienteId=` — listar evoluções
- [ ] POST `/evolucoes` — criar evolução
- [ ] PUT `/evolucoes/[id]/assinar` — assinar evolução (irreversível)
- [ ] GET `/prescricoes?pacienteId=` — listar prescrições
- [ ] POST `/prescricoes` — criar prescrição
- [ ] PUT `/prescricoes/[id]` — ativar/desativar prescrição

#### `/api/agenda/`
- [ ] GET `/` — listar agendamentos (por data, profissional, paciente)
- [ ] POST `/` — criar agendamento
- [ ] PUT `/[id]` — atualizar (confirmar, cancelar, concluir)
- [ ] DELETE `/[id]` — cancelar
- [ ] GET `/disponibilidade` — slots livres por profissional

#### `/api/financeiro/`
- [ ] GET `/movimentacoes` — listar (filtros por período, tipo, status)
- [ ] POST `/movimentacoes` — criar movimentação
- [ ] PUT `/movimentacoes/[id]` — atualizar status (pagar, cancelar)
- [ ] GET `/conta-corrente/[pacienteId]` — extrato do paciente
- [ ] GET `/relatorio` — DRE, fluxo de caixa
- [ ] POST `/pix/cobranca` — gerar cobrança Pix
- [ ] POST `/nfe/emitir` — emitir NFS-e

#### `/api/quartos/`
- [ ] GET `/` — listar quartos com status
- [ ] PUT `/[id]` — atualizar status (check-in, check-out, manutenção)
- [ ] POST `/transferir` — transferir paciente de quarto

#### `/api/estoque/`
- [ ] GET `/` — listar itens (filtros, alertas)
- [ ] POST `/` — adicionar item
- [ ] PUT `/[id]` — atualizar quantidade/dados
- [ ] POST `/movimentacao` — entrada/saída de estoque

#### `/api/documentos/`
- [ ] POST `/gerar` — gerar documento (contrato, receita, etc)
- [ ] GET `/[id]` — download do documento
- [ ] GET `/?pacienteId=` — listar documentos do paciente

#### `/api/integracoes/botconversa/`
- [ ] POST `/enviar-mensagem` — enviar WhatsApp
- [ ] POST `/enviar-fluxo` — disparar fluxo automatizado
- [ ] POST `/webhook` — receber atualizações do BotConversa

#### `/api/integracoes/pix/`
- [ ] POST `/cobranca` — criar cobrança Pix
- [ ] POST `/webhook` — receber confirmação de pagamento
- [ ] GET `/status/[txid]` — consultar status

#### `/api/integracoes/nfe/`
- [ ] POST `/emitir` — emitir NFS-e
- [ ] GET `/[id]` — consultar NFS-e
- [ ] DELETE `/[id]` — cancelar NFS-e

#### `/api/relatorios/`
- [ ] GET `/ocupacao` — relatório de ocupação
- [ ] GET `/financeiro` — DRE e indicadores
- [ ] GET `/clinico` — adesão, evoluções
- [ ] GET `/sisnad` — dados para órgãos públicos

**Impacto:** 100% dos dados são fictícios hardcoded. Nada persiste.

---

## 🟠 IMPORTANTE — Sem isso o sistema não é usável

### 5. FORMULÁRIOS FUNCIONAIS

**O que falta:**
- [ ] Formulário de admissão (pacientes/novo) conectado à API
- [ ] Validação real com Zod (CPF válido, datas, campos obrigatórios)
- [ ] Formulário de nova evolução (com editor rich text)
- [ ] Formulário de nova prescrição
- [ ] Formulário de novo agendamento (com seletor de horário/profissional)
- [ ] Formulário de nova movimentação financeira
- [ ] Formulário de cadastro de item no estoque
- [ ] Formulário de envio de mensagem (WhatsApp/email)
- [ ] Formulário de edição de paciente
- [ ] Formulário de cadastro de novo usuário (admin)

---

### 6. PÁGINAS DETALHADAS (que não existem)

**O que falta:**
- [ ] `/pacientes/[id]` — perfil completo do paciente (dados, prontuário, financeiro, documentos, comunicações — tudo em abas)
- [ ] `/pacientes/[id]/editar` — formulário de edição
- [ ] `/prontuario/nova-evolucao` — página de criação de evolução
- [ ] `/prontuario/[id]` — visualização completa de uma evolução
- [ ] `/agenda/novo` — formulário de agendamento
- [ ] `/financeiro/nova-movimentacao` — formulário financeiro
- [ ] `/financeiro/pix` — tela de geração de Pix com QR Code
- [ ] `/estoque/novo` — formulário de cadastro de item
- [ ] `/documentos/gerar/[tipo]` — wizard de geração de documento por tipo
- [ ] `/comunicacao/nova-mensagem` — formulário de envio
- [ ] `/configuracoes/usuarios` — CRUD de usuários
- [ ] `/configuracoes/perfis` — gestão de permissões
- [ ] `/portal-familia/` — portal completo para familiares (auth separada)

---

### 7. RESPONSIVIDADE MOBILE

**O que falta:**
- [ ] Sidebar colapsável (hamburger menu no mobile)
- [ ] Drawer lateral no mobile (slide from left)
- [ ] Tabelas com scroll horizontal no mobile
- [ ] Cards em stack vertical no mobile
- [ ] Formulários em coluna única no mobile
- [ ] Touch-friendly buttons (min 44px tap target)
- [ ] Bottom navigation bar no mobile (alternativa à sidebar)
- [ ] Testar em 320px, 375px, 768px, 1024px, 1440px

---

### 8. GERAÇÃO DE DOCUMENTOS

**O que falta:**
- [ ] Reinstalar `docxtemplater`, `pizzip` no projeto
- [ ] Migrar lógica do `scripts-adm` para TypeScript/API route
- [ ] Upload de templates .docx customizados
- [ ] Geração server-side de documentos via API
- [ ] Preview de documento antes de gerar
- [ ] Download de .docx e .pdf
- [ ] Armazenamento de documentos gerados (Supabase Storage ou S3)
- [ ] Versionamento de templates

---

### 9. INTEGRAÇÕES EXTERNAS

**O que falta:**

#### BotConversa (WhatsApp)
- [ ] Reinstalar `axios`
- [ ] Implementar `src/lib/integrations/botconversa/client.ts`
- [ ] Configurar API Key nas variáveis de ambiente
- [ ] Envio de mensagens avulsas
- [ ] Disparar fluxos automatizados
- [ ] Receber webhooks (status de entrega)
- [ ] Templates de mensagem editáveis
- [ ] Agendamento de mensagens (cron)
- [ ] Rate limiting (evitar bloqueio do número)

#### Pix BACEN
- [ ] Implementar `src/lib/integrations/pix/client.ts`
- [ ] Configurar certificado mTLS
- [ ] OAuth2 client credentials flow
- [ ] Geração de cobrança imediata
- [ ] Geração de cobrança com vencimento
- [ ] QR Code dinâmico na UI
- [ ] Webhook de confirmação de pagamento
- [ ] Reconciliação automática com movimentações financeiras

#### NF-e / NFS-e
- [ ] Implementar `src/lib/integrations/nfe/client.ts`
- [ ] Escolher provedor (nfe.io, eNotas, Focus NFe)
- [ ] Configurar certificado digital A1
- [ ] Emissão de NFS-e (serviços de saúde)
- [ ] Consulta e cancelamento
- [ ] Armazenamento do XML/PDF da nota
- [ ] Relatório de notas emitidas

---

## 🟡 NECESSÁRIO — Para compliance e qualidade

### 10. SEGURANÇA & LGPD

**O que falta:**
- [ ] Criptografia AES-256 para campos sensíveis (diagnóstico, prescrição)
- [ ] Audit log em toda operação de escrita
- [ ] Log de acesso a prontuários (quem viu o quê, quando)
- [ ] Política de senhas (mínimo 8 chars, maiúscula, número, especial)
- [ ] 2FA (Two-Factor Authentication) — TOTP
- [ ] Timeout de sessão configurável (15min inatividade)
- [ ] Headers de segurança (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting nas APIs
- [ ] Proteção contra CSRF
- [ ] Sanitização de inputs (XSS prevention)
- [ ] Termo de consentimento LGPD na admissão
- [ ] Funcionalidade de exportar dados do paciente (direito do titular)
- [ ] Funcionalidade de anonimizar dados após período legal
- [ ] Backup automático diário
- [ ] Plano de disaster recovery documentado

---

### 11. NOTIFICAÇÕES & ALERTAS

**O que falta:**
- [ ] Sistema de notificações internas (sino no header)
- [ ] Badge com contagem de não-lidas
- [ ] Notificações em tempo real (WebSocket ou polling)
- [ ] Tipos de alerta:
  - Mensalidade vencida
  - Estoque abaixo do mínimo
  - Evolução não assinada há X horas
  - Consulta em 30 minutos
  - Alvará/licença vencendo
  - Paciente com X dias sem evolução
- [ ] Configuração por usuário (quais alertas receber)
- [ ] Envio por email/WhatsApp dos alertas críticos

---

### 12. RELATÓRIOS REAIS

**O que falta:**
- [ ] Consultas SQL/Prisma para calcular KPIs reais
- [ ] Gráficos com Recharts conectados a dados reais
- [ ] Exportação em PDF (usando react-pdf ou puppeteer)
- [ ] Exportação em Excel (usando xlsx ou ExcelJS)
- [ ] Filtros por período, unidade, profissional
- [ ] Comparativos mês a mês
- [ ] Relatório SISNAD (formato exigido pelo Ministério)
- [ ] Relatório para ANVISA (RDC 29/2011)
- [ ] Dashboard com refresh automático (polling 30s)

---

### 13. TESTES AUTOMATIZADOS

**O que falta:**
- [ ] Instalar Vitest
- [ ] Testes unitários para services (validações, cálculos)
- [ ] Testes de integração para API routes
- [ ] Mocks de integrações externas
- [ ] Testes de RBAC (acesso negado por perfil)
- [ ] Fixtures com dados de pacientes fictícios
- [ ] CI/CD no GitHub Actions (rodar testes em cada PR)
- [ ] Cobertura mínima 80% em services
- [ ] Testes E2E com Playwright (futuro)

---

## 🟢 MELHORIAS — Nice to have

### 14. UX/UI APRIMORADA

- [ ] Dark mode toggle funcional
- [ ] Skeleton loaders durante carregamento
- [ ] Infinite scroll na lista de pacientes
- [ ] Drag-and-drop para escalas
- [ ] Calendário visual completo (dia/semana/mês) na agenda
- [ ] Busca global (Command+K) para encontrar paciente/ação
- [ ] Breadcrumbs em páginas internas
- [ ] Animações de transição entre páginas (Framer Motion)
- [ ] Avatar do usuário logado no header
- [ ] Indicador de "quem está online" (WebSocket)

### 15. PORTAL DA FAMÍLIA

- [ ] Auth separada (token por familiar, não User)
- [ ] Dashboard simplificado (evolução resumida, fotos, comunicados)
- [ ] Histórico de pagamentos
- [ ] Agendamento de visitas
- [ ] Chat com equipe (via BotConversa)
- [ ] Opt-in/opt-out LGPD

### 16. INFRAESTRUTURA

- [ ] Docker Compose para desenvolvimento local (PostgreSQL + Redis)
- [ ] Redis para cache de sessões e queries pesadas
- [ ] File storage (Supabase Storage ou AWS S3) para documentos
- [ ] CDN para assets estáticos
- [ ] Monitoramento (Sentry para erros, Vercel Analytics)
- [ ] Logs estruturados (Pino ou Winston)
- [ ] Health check endpoint
- [ ] Domínio customizado (ex: app.hachi.med.br)

---

## 📐 RESUMO QUANTITATIVO

| Categoria | Total | Concluídos | Pendentes | Prioridade |
|-----------|:---:|:---:|:---:|------------|
| Banco de Dados | 6 | 6 | 0 | ✅ Completo |
| Autenticação | 9 | 8 | 1 (Esqueci senha) | 🟡 Quase |
| RBAC | 7 | 4 | 3 (UI condicional, isolamento clínico) | 🟡 |
| API Routes | 45+ | 35 | ~10 (Pix, NF-e, relatórios) | 🟡 |
| Formulários | 10 | 8 | 2 (novo usuário, rich text) | 🟡 |
| Páginas Detalhadas | 13 | 8 | 5 (Pix, config/users, portal) | 🟡 |
| Responsividade | 8 | 7 | 1 (bottom nav) | 🟡 Quase |
| Geração de Documentos | 8 | 6 | 2 (upload templates, storage) | 🟡 |
| Integrações | 25+ | 8 | ~17 (Pix, NF-e, rate limit) | 🟠 |
| Segurança/LGPD | 15 | 5 | 10 (2FA, criptografia, LGPD terms) | 🟡 |
| Notificações | 9 | 0 | 9 | 🟡 |
| Relatórios Reais | 9 | 0 | 9 | 🟡 |
| Testes | 9 | 0 | 9 | 🟡 |
| UX Aprimorada | 10 | 0 | 10 | 🟢 |
| Portal Família | 6 | 0 | 6 | 🟢 |
| Infraestrutura | 8 | 2 | 6 | 🟢 |
| **TOTAL** | **~190** | **~97** | **~93** | **~51% concluído** |

---

## 🎯 ROADMAP SUGERIDO (Ordem de Execução)

```
SPRINT 1 (1 semana) — Fundação ✅ COMPLETO
├── ✅ Banco de Dados (Neon) + Prisma conectado
├── ✅ Auth real (login/logout/sessão)
├── ✅ RBAC básico (middleware)
├── ✅ Remover output: "export" → SSR na Vercel
└── ✅ API: CRUD pacientes + users

SPRINT 2 (1 semana) — Core Clínico ✅ COMPLETO
├── ✅ API: Evoluções + Prescrições
├── ✅ API: Agendamentos
├── ✅ Formulários funcionais (admissão, evolução, agendamento)
├── ✅ Página de perfil do paciente (/pacientes/[id])
└── ✅ Responsividade mobile (sidebar)

SPRINT 3 (1 semana) — Financeiro & Docs ✅ COMPLETO
├── ✅ API: Movimentações financeiras
├── ✅ API: Geração de documentos (docxtemplater portado)
├── ⬜ Integração Pix (cobrança + webhook)
├── ✅ Geração de contrato/receita/recibo
└── ✅ Conta corrente por paciente

SPRINT 4 (1 semana) — Comunicação & Integrações ✅ PARCIAL
├── ✅ Integração BotConversa (envio + webhook)
├── ✅ Envio de mensagens WhatsApp
├── ✅ Fluxos automatizados (disparar fluxo)
├── ⬜ Portal da família (básico)
└── ⬜ Integração NF-e (emissão)

SPRINT 5 (próxima) — Segurança & Qualidade
├── ⬜ Relatórios reais com dados do banco (Dashboard, Ocupação, Financeiro)
├── ⬜ RBAC granular na sidebar (esconder itens por role)
├── ⬜ Criptografia de campos sensíveis (AES-256)
├── ⬜ Testes automatizados (Vitest)
├── ⬜ Notificações internas (sino no header)
└── ⬜ Tela de Audit Log (para ADMIN)

SPRINT 6 — Polish & Go Live
├── ⬜ Dark mode
├── ⬜ Busca global (Cmd+K)
├── ⬜ 2FA (TOTP)
├── ⬜ Integração Pix (EFI/Gerencianet)
├── ⬜ Integração NF-e (nfe.io)
├── ⬜ Portal da família
└── ⬜ Testes E2E (Playwright)
```

---

## 💡 DECISÕES TÉCNICAS PENDENTES

| Decisão | Opções | Recomendação |
|---------|--------|-------------|
| Hosting mode | Static Export vs SSR | **SSR** (precisa de API routes) |
| Auth library | NextAuth vs Custom JWT | **Custom JWT** (mais controle para RBAC) |
| File storage | Supabase Storage vs S3 | **Supabase** (free tier generoso) |
| Real-time | WebSocket vs Polling | **Polling** (mais simples, escala melhor no free tier) |
| PDF generation | react-pdf vs Puppeteer | **docxtemplater** (já testado no scripts-adm) |
| Email | Resend vs SendGrid | **Resend** (free tier, API moderna) |
| Pix provider | Direto BACEN vs Intermediador | **Intermediador** (ex: Gerencianet/EFI, mais fácil) |
| NF-e provider | nfe.io vs eNotas vs Focus | **nfe.io** (API REST limpa, free trial) |

---

## ⚠️ RISCOS

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:---:|:---:|-----------|
| Vercel free tier esgota (bandwidth) | Média | Alto | Monitorar uso, upgrade se necessário |
| Neon free tier esgota (500MB) | Baixa | Alto | Monitorar, cleanup de audit logs antigos |
| BotConversa bloqueia número | Média | Médio | Rate limiting, warm-up gradual |
| Certificado Pix inválido | Média | Alto | Testar em sandbox antes de produção |
| LGPD: vazamento de dados | Baixa | Crítico | Criptografia, RBAC, audit, treinamento |

---

*Este documento deve ser usado como referência para todas as próximas sessões de desenvolvimento. Cada item marcado como `[ ]` se torna uma task concreta no backlog.*
