# 🚀 Hachi Platform — Tasks Go Live

> Lista completa para lançamento. Apenas itens que NÃO dependem de externos.
> Status: ⬜ Pendente | 🟡 Em progresso | ✅ Concluído

---

## SPRINT 1 — Formulários Verticais Funcionais

| # | Task | Vertical | Descrição |
|---|------|----------|-----------|
| 1.1 | Form Anamnese (Clinic) | Clinic | Página /prontuario/anamnese com form completo → POST /api/clinic/anamnese |
| 1.2 | Form Nova Reserva (Hotel) | Hotel | Modal/page em /reservas com form → POST /api/hotel/reservas |
| 1.3 | Form Medicação (Senior) | Senior | Página /ferramentas/medicacao com form → POST /api/senior/medicacao |
| 1.4 | Form Vacina (Vet) | Vet | Página /ferramentas/vacinas com form → POST /api/vet/vacinas |
| 1.5 | Form Boletim (Education) | Education | Página /ferramentas/boletim com form → POST /api/education/boletim |
| 1.6 | Form Proposta (Services) | Services | Página /ferramentas/propostas com form → POST /api/services/propostas |
| 1.7 | Form Timesheet (Services) | Services | Seção em /ferramentas com form → POST /api/services/timesheet |
| 1.8 | Form Tarifa (Hotel) | Hotel | Seção em /ferramentas com form → POST /api/hotel/tarifas |

---

## SPRINT 2 — Billing & Pagamento

| # | Task | Descrição |
|---|------|-----------|
| 2.1 | Página de Planos (/configuracoes/plano) | Mostra plano atual, usage, opções de upgrade |
| 2.2 | API de checkout (/api/platform/checkout) | Gera link de pagamento (Stripe/Asaas) ou mostra dados Pix |
| 2.3 | Webhook de pagamento recebido | Atualiza plano do tenant no banco |
| 2.4 | Bloquear tenant se pagamento vencido | Middleware check: tenant.active = false → redirect para /billing |
| 2.5 | Página de billing bloqueado | Tela que aparece quando tenant está suspenso |
| 2.6 | Trial de 14 dias | Novos tenants têm 14 dias free, depois bloqueiam |

---

## SPRINT 3 — White-Label & Branding

| # | Task | Descrição |
|---|------|-----------|
| 3.1 | Upload de logo por tenant | Campo no Super Admin → armazena como base64 no config |
| 3.2 | Logo dinâmica na sidebar | Sidebar busca logo do tenant, usa default se não tiver |
| 3.3 | Logo dinâmica na login page | Login mostra logo do tenant (se acessar via subdomain) |
| 3.4 | Cores customizáveis (primary/accent) | Além da cor primária, permitir accent color |
| 3.5 | Favicon dinâmico por tenant | Aplicar logo como favicon |

---

## SPRINT 4 — Email & Notificações

| # | Task | Descrição |
|---|------|-----------|
| 4.1 | Configurar Resend (ou SES) | API key, domínio verificado |
| 4.2 | Email: forgot password funcional | Enviar email real com link de reset |
| 4.3 | Email: convite de usuário | Enviar email com credenciais temporárias |
| 4.4 | Email: alerta de inadimplência | Enviar para admin quando mensalidade vence |
| 4.5 | Push notifications (Web Push API) | Subscribe, store subscription, send push |
| 4.6 | Push: alerta de agendamento | Notificar profissional 30min antes |
| 4.7 | Push: nova mensagem | Notificar quando comunicação recebida |

---

## SPRINT 5 — Upload & Mídia

| # | Task | Descrição |
|---|------|-----------|
| 5.1 | API de upload (/api/upload) | Aceita imagem, armazena como base64 ou S3 URL |
| 5.2 | Foto do paciente | Campo na ficha, exibe no perfil e listas |
| 5.3 | Logo upload no Super Admin | Admin pode subir logo para cada tenant |
| 5.4 | Avatar do usuário | Upload de foto de perfil |

---

## SPRINT 6 — i18n & Internacionalização

| # | Task | Descrição |
|---|------|-----------|
| 6.1 | Selector de idioma na sidebar | Dropdown com pt-BR, en, es |
| 6.2 | Aplicar t() nos componentes base | Buttons (Salvar, Cancelar, Excluir), loading states |
| 6.3 | Traduzir sidebar labels | Menu items em inglês/espanhol |
| 6.4 | Traduzir mensagens de erro | "Não autenticado", "Acesso negado", etc. |
| 6.5 | Persistir idioma escolhido | localStorage + cookie para SSR |

---

## SPRINT 7 — Qualidade & Testes

| # | Task | Descrição |
|---|------|-----------|
| 7.1 | Testes E2E: login flow | Playwright: login → dashboard → verifica KPIs |
| 7.2 | Testes E2E: criar paciente | Playwright: cadastro → lista → verifica |
| 7.3 | Testes E2E: onboarding | Playwright: signup → dashboard → vertical features |
| 7.4 | Testes E2E: tenant isolation | Playwright: 2 logins, verifica dados separados |
| 7.5 | Testes de carga | k6 ou Artillery: 100 requests/sec sustentado |
| 7.6 | Accessibility audit (axe) | Rodar axe-core em todas as páginas |
| 7.7 | Lighthouse > 90 em todas as páginas | Performance, SEO, A11y, Best Practices |

---

## SPRINT 8 — Polish & Go Live

| # | Task | Descrição |
|---|------|-----------|
| 8.1 | Relatórios com gráficos (Recharts) | Instalar recharts, gráficos reais no /relatorios |
| 8.2 | Empty states em todas as páginas | Cada módulo vazio mostra mensagem + CTA amigável |
| 8.3 | Skeleton loaders | Todos os fetchs mostram skeleton enquanto carregam |
| 8.4 | Error boundaries | Catch de erros em cada página com fallback UI |
| 8.5 | 404 page customizada | Página bonita para rotas inexistentes |
| 8.6 | Revisão final de textos | Garantir que não existe "ERP" em nenhum lugar |
| 8.7 | Meta tags OG (Open Graph) | Compartilhamento correto no WhatsApp/LinkedIn |
| 8.8 | Sitemap.xml | Para SEO das landing pages |
| 8.9 | robots.txt | Bloquear /dashboard, /api do Google |
| 8.10 | CHANGELOG.md | Documentar versões para clientes |

---

## Resumo

| Sprint | Tasks | Foco |
|--------|:-----:|------|
| 1 | 8 | Formulários verticais funcionais |
| 2 | 6 | Billing & pagamento |
| 3 | 5 | White-label & branding |
| 4 | 7 | Email & notificações push |
| 5 | 4 | Upload & mídia |
| 6 | 5 | i18n |
| 7 | 7 | Testes & qualidade |
| 8 | 10 | Polish & go live |
| **Total** | **52** | |

---

## Ordem de Execução

```
Sprint 1 (Formulários) → Sprint 2 (Billing) → Sprint 3 (White-label)
    ↓
Sprint 4 (Email/Push) → Sprint 5 (Upload)
    ↓
Sprint 6 (i18n) → Sprint 7 (Testes) → Sprint 8 (Polish)
    ↓
🚀 GO LIVE
```

---

*Criado: Julho 2026 — Go Live Target: Agosto 2026*
