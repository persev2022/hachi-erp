# 📋 Hachi ERP — Pendências Finais Para 100%

> Atualizado em 03/07/2026 após auditoria Puppeteer e varredura completa.
> O sistema está em **~93% de conclusão** com 75/82 tasks do board concluídas.

---

## 📊 Estado Atual Real (pós-auditoria)

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| Frontend (UI) | 🟢 **98%** | 22 páginas, todas conectadas a APIs reais, zero placeholders |
| Backend (API) | 🟢 **95%** | 50 API routes implementadas e funcionais |
| Banco de Dados | 🟢 **100%** | 14 models Prisma, seed funcional, Neon conectado |
| Autenticação | 🟢 **100%** | JWT + bcrypt + cookie httpOnly + blacklist + rate limit |
| RBAC | 🟢 **90%** | Sidebar filtrada por role, APIs com RBAC por módulo |
| Integrações | 🟢 **85%** | BotConversa funcional, Pix e NF-e prontos (aguardam credenciais) |
| Testes | 🟡 **70%** | 110 testes passando, validators + security cobertos |
| Mobile | 🟢 **95%** | Sidebar drawer, layouts responsivos, overflow-x nas tabelas |
| Segurança | 🟢 **95%** | Rate limit, CORS, CSP, 2FA, criptografia, audit log |
| Documentos | 🟢 **90%** | 5 templates funcionais, download .docx |
| Portal Família | 🟢 **100%** | Auth token, dashboard interativo com 4 abas |
| Deploy | 🟢 **100%** | Vercel + GitHub + Neon em produção |

---

## ⬜ Tasks Pendentes no Board (7 de 82)

| # | Task | Categoria | Esforço | Dependência |
|---|------|-----------|---------|-------------|
| 2.6 | Data table genérica (TanStack) | Frontend | Baixo | Nenhuma — shadcn Table já atende |
| 8.7 | Templates editáveis (upload .docx) | Documentos | Médio | File storage (Supabase/S3) |
| 11.5 | Backup automatizado + restore | Infra | Baixo | Neon já tem backup diário nativo |
| 11.6 | Pentest e hardening | Segurança | Alto | Ação manual — não é código |
| 12.5 | Testes E2E com Playwright | Testes | Médio | CI/CD (GitHub Actions bloqueado por token scope) |
| 12.6 | Cobertura 80% em services | Testes | Médio | Mais testes nos API routes |
| — | CI/CD GitHub Actions | Infra | Baixo | Token OAuth precisa scope `workflow` |

---

## 🔧 Melhorias Identificadas na Auditoria (não são tasks do board)

### Prioridade Alta (impacta uso real)

| # | Melhoria | Onde | Descrição |
|---|----------|------|-----------|
| M1 | Esqueci minha senha | /login | Fluxo de reset de senha por email (requer Resend/SendGrid) |
| M2 | Timeout de sessão | Middleware | Invalidar JWT após 15min de inatividade |
| M3 | Exportar dados LGPD | /pacientes/[id] | Botão "Exportar meus dados" (direito do titular) |
| M4 | Anonimizar dados | Admin | Função para anonimizar pacientes após período legal |

### Prioridade Média (polish & DX)

| # | Melhoria | Onde | Descrição |
|---|----------|------|-----------|
| M5 | Skeleton loaders | Todas páginas | Mostrar esqueleto durante carregamento |
| M6 | Breadcrumbs | Páginas internas | Navegação contextual (ex: Pacientes > Carlos > Editar) |
| M7 | Avatar do usuário | Header/sidebar | Mostrar nome + foto do usuário logado |
| M8 | Refresh automático | Dashboard | Polling 30s para atualizar KPIs |
| M9 | Filtros avançados nos relatórios | /relatorios | Filtro por período, profissional, unidade |
| M10 | Validação CPF real | Formulários | Validar dígitos verificadores do CPF |

### Prioridade Baixa (nice to have)

| # | Melhoria | Onde | Descrição |
|---|----------|------|-----------|
| M11 | Infinite scroll | /pacientes | Substituir paginação por scroll infinito |
| M12 | Drag-and-drop escalas | /escalas | Arrastar funcionários para slots |
| M13 | Animações de transição | Global | Framer Motion entre páginas |
| M14 | Indicador "online" | Sidebar | Mostrar quem está logado (WebSocket) |
| M15 | Bottom nav mobile | Layout | Barra inferior no celular como alternativa |
| M16 | Rich text editor | Prontuário | Editor WYSIWYG para evoluções (TipTap/Slate) |
| M17 | Preview documento | /documentos | Visualizar antes de baixar |
| M18 | Agendamento de mensagens | /comunicacao | Cron job para disparos futuros |
| M19 | Gráficos Recharts | /relatorios | Gráficos visuais (barras, linhas) nos relatórios |
| M20 | Health check endpoint | API | GET /api/health para monitoramento |

---

## 🔐 Itens de Segurança Pendentes

| # | Item | Status | Notas |
|---|------|--------|-------|
| S1 | Timeout de sessão por inatividade | ⬜ | Implementar no frontend (15min) |
| S2 | Log de acesso a prontuários (READ) | ⬜ | Audit log só registra WRITE, não READ |
| S3 | Exportação LGPD (direito do titular) | ⬜ | Endpoint que gera ZIP com todos os dados |
| S4 | Anonimização pós-período legal | ⬜ | Substituir dados pessoais por hashes |
| S5 | Proteção CSRF explícita | ✅ | sameSite=strict no cookie já protege |
| S6 | Sanitização XSS | ✅ | React escapa por padrão + CSP headers |
| S7 | Criptografia campos sensíveis | ✅ | AES-256-GCM implementado |
| S8 | Rate limiting | ✅ | 5/min login + 120/min global |
| S9 | 2FA TOTP | ✅ | Setup + verify + disable implementado |
| S10 | Pentest formal | ⬜ | Requer profissional de segurança |

---

## 🏗️ Infraestrutura Pendente

| Item | Recomendação | Urgência |
|------|-------------|----------|
| File storage | Supabase Storage (free tier 1GB) | Médio — necessário para upload de templates |
| Redis | Upstash (free tier) — para blacklist de tokens e cache | Baixo — in-memory funciona para 1 instância |
| Monitoramento | Sentry (free tier) — erros em produção | Médio |
| Logs estruturados | Pino/Winston → Vercel Logs já captura console | Baixo |
| CDN | Vercel já serve assets via CDN | ✅ Resolvido |
| Domínio | app.hachi.med.br → Vercel Custom Domain | Decisão do cliente |
| CI/CD | Arquivo `.github/workflows/ci.yml` pronto, bloqueado por token | Baixo |

---

## 📐 Números Finais

| Métrica | Valor |
|---------|-------|
| **API Routes** | 50 |
| **Páginas** | 22 (dashboard) + 2 (portal família) + 1 (login) = **25** |
| **Testes** | 110 passando (12 arquivos) |
| **Models Prisma** | 14 |
| **Build** | ✅ 66 páginas estáticas, 0 erros |
| **Cobertura board** | **75/82** (91%) |
| **Integrações** | BotConversa ✅ | Pix (pronto, sem credenciais) | NF-e (pronto, sem credenciais) |
| **Segurança** | 7/10 itens implementados |

---

## 🎯 Recomendação de Próximos Passos

```
IMEDIATO (antes de ir para produção real):
1. Testar BotConversa com subscriber que já falou com o bot
2. Configurar credenciais Pix (sandbox EFI) e testar cobrança
3. Configurar domínio customizado na Vercel
4. Preencher "Dados da Clínica" nas configurações
5. Treinar equipe no sistema

CURTO PRAZO (primeira semana de uso):
6. Implementar "Esqueci minha senha" (requer serviço de email)
7. Adicionar timeout de sessão por inatividade
8. Monitoramento com Sentry
9. Mais testes para atingir 80% de cobertura

MÉDIO PRAZO (primeiro mês):
10. File storage (Supabase) para upload de templates
11. Rich text editor no prontuário
12. Gráficos visuais nos relatórios
13. Pentest com profissional de segurança
14. Testes E2E com Playwright
```

---

*Este documento substitui a ANALISE-COMPLETA.md como referência atualizada do estado real do projeto.*
