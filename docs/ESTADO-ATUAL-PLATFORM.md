# Hachi Platform — Estado Atual e O Que Falta Para 100%

> Atualizado: Julho 2026
> Contexto: Sistema evoluiu de ERP vertical para Business OS multi-tenant com 8 verticais

---

## Números Atuais

| Métrica | Valor |
|---------|-------|
| Linhas de código (TypeScript) | 25.023 |
| Páginas/Rotas | 105 |
| API Routes | 70+ |
| Modelos Prisma | 15 (+ Notification) |
| Verticais implementadas | 8 |
| Tenants demo criados | 9 |
| Feature flag presets | 8 |
| Landing pages | 9 |
| Testes automatizados | 135 |

---

## Status por Camada

| Camada | Status | % |
|--------|--------|---|
| Core Engine (auth, RBAC, audit, rate limit, CORS) | ✅ Completo | 95% |
| Multi-tenant (modelo, JWT, feature flags, sidebar, dashboard) | ✅ Ativado | 90% |
| Business OS — Financeiro | ✅ Produção | 90% |
| Business OS — Agenda | ✅ Produção | 85% |
| Business OS — Documentos | ✅ Produção | 90% |
| Business OS — Estoque | ✅ Produção | 80% |
| Business OS — Comunicação (WhatsApp) | ✅ Produção | 85% |
| Business OS — Relatórios/BI | ✅ Produção | 80% |
| Business OS — CRM | ✅ Básico | 60% |
| Business OS — Automação | ✅ Foundation | 50% |
| Business OS — Billing | ✅ Foundation | 40% |
| Business OS — Notificações | ✅ Foundation | 50% |
| Vertical: Recovery | ✅ Produção real (CT Persev) | 95% |
| Vertical: Clinic | ✅ Demo funcional | 70% |
| Vertical: Senior | 🟡 Módulo + Landing | 40% |
| Vertical: Hotel | 🟡 Módulo + Landing | 35% |
| Vertical: Restaurant | 🟡 Módulo + Landing | 30% |
| Vertical: Education | 🟡 Módulo + Landing | 30% |
| Vertical: Vet | 🟡 Módulo + Landing | 30% |
| Vertical: Services | 🟡 Módulo + Landing | 30% |
| Super Admin Portal | ✅ Funcional | 85% |
| Onboarding Self-service | ✅ Funcional | 80% |
| Landing Pages | ✅ 9 páginas profissionais | 90% |
| Portal da Família | ✅ Recovery only | 80% |
| Infraestrutura (Vercel + Neon) | ✅ | 90% |
| SEO/Landing/Marketing | ✅ | 85% |

---

## O QUE ESTÁ 100% PRONTO (não precisa mexer)

1. **Autenticação** — JWT, bcrypt, cookie httpOnly, blacklist, 2FA, policy de senhas
2. **RBAC** — 10 roles, middleware, sidebar dinâmica, API guards, route protection
3. **Audit Log** — Toda escrita registrada com IP, user, entity, details
4. **Segurança** — AES-256, rate limiting, CORS allowlist, CSP headers, LGPD export
5. **Geração de Documentos** — 5 templates (contrato, recibo, receitas, atestado), funcional
6. **Portal da Família** — Token auth, dashboard, evoluções, agenda, Pix QR
7. **Multi-tenant** — Modelo Tenant, JWT com tenantId, feature flags, sidebar/dashboard adaptáveis
8. **Super Admin** — KPIs, CRUD tenants, feature toggles, health, billing, invite
9. **Onboarding** — Self-service em 3 steps, cria tenant + user + auto-login
10. **Schema Prisma** — 15+ modelos, tenantId em todas as tabelas principais
11. **Recovery completo** — 36 pacientes reais, 25 responsáveis, 11 quartos, em produção

---

## O QUE FALTA — Organizado por Prioridade

### 🔴 PRIORIDADE MÁXIMA (depende de terceiros)

| Item | Bloqueio | Solução |
|------|----------|---------|
| Pix em produção (Sicredi) | Certificado mTLS da cooperativa | Aguardar ou trocar para EFI/Gerencianet |
| Migração OCI Always Free | Conta OCI + setup de VM | Criar conta, seguir plano existente |

### 🟠 ALTA PRIORIDADE (podemos fazer agora)

| Item | Esforço | Impacto |
|------|---------|---------|
| UI adaptada por terminologia (frontend dinâmico) | 3-5 dias | Alto — demos ficam personalizadas |
| Testes de isolamento multi-tenant | 2 dias | Crítico para segurança |
| White-label (branding por tenant) | 3 dias | Diferencial comercial |
| Notificações no header (sino + badge) | 2 dias | UX percebida |
| CRM expandido (pipeline visual, tags) | 5 dias | Diferencial vs concorrentes |
| Automação executando ações reais | 5 dias | Reduz trabalho manual do cliente |
| Portal adaptado por vertical | 5 dias | Cada vertical tem seu portal externo |
| Billing real (Stripe/Asaas) | 5 dias | Revenue automático |
| Domínio customizado | 1 dia | Profissionalismo (hachi.app ou similar) |

### 🟡 MÉDIA PRIORIDADE

| Item | Esforço | Impacto |
|------|---------|---------|
| PWA (Progressive Web App) | 2 dias | Acesso offline, instala como app |
| Push notifications (Web Push API) | 3 dias | Alertas em tempo real |
| Upload de fotos (paciente/animal) | 3 dias | Identificação visual |
| Logs estruturados (Pino) | 1 dia | Debug em produção |
| Métricas por tenant (analytics) | 3 dias | Entender uso, churn |
| Relatórios com gráficos (Recharts) | 3 dias | Mais visual |
| Exportação PDF | 2 dias | Complementa Excel |
| Multi-idioma (i18n) | 5 dias | Mercado latam/global |

### 🟢 VERTICAIS — O que cada uma precisa para estar "vendável"

| Vertical | O que falta | Esforço |
|----------|-------------|---------|
| **Clinic** | Faturamento TISS, módulo exames, portal paciente | 10 dias |
| **Senior** | Controle de medicação, atividades, relatório familiar | 8 dias |
| **Hotel** | Booking engine, tarifas dinâmicas, channel manager | 15 dias |
| **Restaurant** | PDV completo, comandas, KDS, integração iFood | 20 dias |
| **Education** | Boletim, grade curricular, portal pais adaptado | 10 dias |
| **Vet** | Prontuário animal completo, carteira vacinal | 8 dias |
| **Services** | Pipeline de propostas, timesheet, contratos auto | 10 dias |

### 🔵 FUTURO (diferencial competitivo)

| Item | Descrição |
|------|-----------|
| IA para predição de recaída | ML baseado em padrões (Recovery) |
| NLP em evoluções | Extração automática de indicadores |
| Telemedicina | Jitsi/Meet integrado (Clinic) |
| Assinatura Digital ICP-Brasil | Prontuário legal A1/A3 |
| App nativo (React Native) | iOS + Android |
| FHIR (HL7) | Interoperabilidade com SUS |
| Webhook delivery real | POST para URLs do cliente |
| Marketplace de módulos | Instalar/desinstalar como plugins |
| API pública com OAuth2 | Integradores externos |

---

## PLANO DE AÇÃO — Próximas 4 Semanas

### Semana 1: Qualidade + Segurança
- [ ] Testes de isolamento multi-tenant (tenant A ≠ tenant B)
- [ ] Notificações no header (sino + badge + polling)
- [ ] White-label básico (logo + cor por tenant no config)
- [ ] Domínio customizado (configurar DNS)

### Semana 2: Produto + UX
- [ ] UI com terminologia dinâmica em todas as páginas (não só sidebar)
- [ ] Portal adaptado por vertical (portal do paciente/hóspede/tutor)
- [ ] CRM pipeline visual (kanban de pacientes/clientes)
- [ ] PWA manifest + service worker

### Semana 3: Revenue + Automação
- [ ] Billing real com gateway (Stripe ou Asaas)
- [ ] Automação executando ações (WhatsApp, notificação, email)
- [ ] Métricas por tenant (uso, logins, crescimento)
- [ ] Push notifications

### Semana 4: Verticais + Demo
- [ ] Clinic: faturamento TISS + exames
- [ ] Senior: medicação + atividades
- [ ] Vet: prontuário animal + vacinas
- [ ] Demo day: apresentação completa para stakeholders

---

## RESUMO QUANTITATIVO ATUALIZADO

| Categoria | Total Tasks | Feitas | Pendentes | % |
|-----------|:-----------:|:------:|:---------:|:---:|
| Core Engine | 20 | 19 | 1 | 95% |
| Multi-tenant | 12 | 11 | 1 | 92% |
| Business OS (shared) | 35 | 28 | 7 | 80% |
| Vertical Recovery | 15 | 15 | 0 | 100% |
| Vertical Clinic | 10 | 7 | 3 | 70% |
| Verticais restantes (6) | 60 | 18 | 42 | 30% |
| Landing/Marketing | 12 | 11 | 1 | 92% |
| Super Admin | 8 | 8 | 0 | 100% |
| Infraestrutura | 10 | 7 | 3 | 70% |
| **TOTAL** | **~182** | **~124** | **~58** | **~68%** |

---

## QUANDO ESTÁ "PRONTA PARA PRODUÇÃO"?

A plataforma **já está em produção** com o Recovery (CT Persev). Para estar pronta como **produto SaaS multi-vertical vendável**, faltam:

1. ✅ Multi-tenant ativo (FEITO)
2. ✅ Onboarding self-service (FEITO)
3. ✅ Super Admin (FEITO)
4. ✅ Feature flags (FEITO)
5. ✅ Landing pages por vertical (FEITO)
6. ⬜ Billing real (cobrança automática)
7. ⬜ White-label (branding por tenant)
8. ⬜ Pelo menos 2 verticais completas (Recovery ✅ + Clinic 70%)
9. ⬜ Testes de isolamento validados
10. ⬜ Domínio próprio

**Estimativa para "pronto para vender": 3-4 semanas de desenvolvimento focado.**

---

*Documento vivo — atualizar conforme o progresso avança.*
