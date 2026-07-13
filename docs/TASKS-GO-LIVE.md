# Hachi Platform — Tasks Go Live

> Lista completa para lançamento. Apenas itens que NÃO dependem de externos.
> Status: ⬜ Pendente | 🟡 Em progresso | ✅ Concluído

---

## SPRINT 1 — Formulários Verticais Funcionais ✅

| # | Task | Vertical | Status |
|---|------|----------|--------|
| 1.1 | Form Anamnese (Clinic) | Clinic | ✅ |
| 1.2 | Form Nova Reserva (Hotel) | Hotel | ✅ |
| 1.3 | Form Medicação (Senior) | Senior | ✅ |
| 1.4 | Form Vacina (Vet) | Vet | ✅ |
| 1.5 | Form Boletim (Education) | Education | ✅ |
| 1.6 | Form Proposta (Services) | Services | ✅ |
| 1.7 | Form Timesheet (Services) | Services | ✅ |
| 1.8 | Form Tarifa (Hotel) | Hotel | ✅ |

---

## SPRINT 2 — Billing & Pagamento ✅

| # | Task | Status |
|---|------|--------|
| 2.1 | Página de Planos (/configuracoes/plano) | ✅ |
| 2.2 | API de checkout (/api/platform/checkout) | ✅ |
| 2.3 | Webhook de pagamento recebido | ✅ |
| 2.4 | Bloquear tenant se trial expirou | ✅ |
| 2.5 | Tela de bloqueio (trial-banner lock screen) | ✅ |
| 2.6 | Trial de 14 dias | ✅ |

---

## SPRINT 3 — White-Label & Branding ✅

| # | Task | Status |
|---|------|--------|
| 3.1 | Upload de logo por tenant | ✅ (via Super Admin) |
| 3.2 | Logo dinâmica na sidebar | ✅ |
| 3.3 | Logo dinâmica na login page | ✅ |
| 3.4 | Cores customizáveis (primary/accent) | ✅ |
| 3.5 | Favicon dinâmico por tenant | ⬜ (nice-to-have) |

---

## SPRINT 4 — Email & Notificações

| # | Task | Status |
|---|------|--------|
| 4.1 | Configurar Resend | ✅ (resend na package.json) |
| 4.2 | Email: forgot password funcional | ⬜ (depende de domínio verificado) |
| 4.3 | Email: convite de usuário | ⬜ |
| 4.4 | Email: alerta de inadimplência | ⬜ |
| 4.5 | Push notifications (Web Push API) | ✅ |
| 4.6 | Push: alerta de agendamento | ⬜ (integrar com agenda) |
| 4.7 | Push: nova mensagem | ⬜ |

---

## SPRINT 5 — Upload & Mídia ✅

| # | Task | Status |
|---|------|--------|
| 5.1 | API de upload (/api/upload) | ✅ |
| 5.2 | Foto do paciente (PhotoUpload component) | ✅ |
| 5.3 | Logo upload no Super Admin | ✅ |
| 5.4 | Avatar do usuário | ✅ (reusa PhotoUpload) |

---

## SPRINT 6 — i18n & Internacionalização ✅

| # | Task | Status |
|---|------|--------|
| 6.1 | Selector de idioma na sidebar | ✅ |
| 6.2 | Sistema de traduções (pt-BR, en, es) | ✅ |
| 6.3 | Provider + hook useI18n | ✅ |
| 6.4 | Persistir idioma (localStorage) | ✅ |
| 6.5 | t() function para uso em componentes | ✅ |

---

## SPRINT 7 — Qualidade & Testes

| # | Task | Status |
|---|------|--------|
| 7.1 | Testes unitários (vitest) | ✅ (144 passando) |
| 7.2 | Testes E2E: login flow | ⬜ (precisa Playwright) |
| 7.3 | Testes E2E: criar paciente | ⬜ |
| 7.4 | Testes E2E: tenant isolation | ⬜ |
| 7.5 | Testes de carga | ⬜ |
| 7.6 | Accessibility audit (axe) | ⬜ |
| 7.7 | Lighthouse > 90 | ⬜ |

---

## SPRINT 8 — Polish & Go Live

| # | Task | Status |
|---|------|--------|
| 8.1 | Relatórios com Recharts | ✅ |
| 8.2 | Empty states em páginas | ⬜ |
| 8.3 | Skeleton loaders | ✅ |
| 8.4 | Error boundaries | ✅ |
| 8.5 | 404 page customizada | ✅ |
| 8.6 | Revisão final de textos | ✅ |
| 8.7 | Meta tags OG (Open Graph) | ⬜ |
| 8.8 | Sitemap.xml | ✅ (existe em /public) |
| 8.9 | robots.txt | ✅ (existe em /public) |
| 8.10 | CHANGELOG.md | ✅ |

---

## Extras Implementados

| Item | Status |
|------|--------|
| Dark mode funcional | ✅ |
| Marketplace de módulos | ✅ |
| Assinatura digital SHA-256 | ✅ |
| Geração automática de contratos | ✅ |
| Landing pages com parallax | ✅ |
| Portal da Família | ✅ |
| Command Search (Cmd+K) | ✅ |
| Session timeout | ✅ |

---

## Resumo Final

| Sprint | Total | Concluído | % |
|--------|:-----:|:---------:|:-:|
| 1 - Formulários | 8 | 8 | 100% |
| 2 - Billing | 6 | 6 | 100% |
| 3 - White-label | 5 | 4 | 80% |
| 4 - Notificações | 7 | 2 | 29% |
| 5 - Upload | 4 | 4 | 100% |
| 6 - i18n | 5 | 5 | 100% |
| 7 - Testes | 7 | 1 | 14% |
| 8 - Polish | 10 | 7 | 70% |
| **Total** | **52** | **37** | **71%** |

---

## Pendente para Go Live Completo

1. **Emails transacionais** — Resend já instalado, precisa domínio verificado e templates
2. **Testes E2E** — Playwright (5 dias de esforço)
3. **Meta tags OG** — Para compartilhamento social
4. **Empty states** — Mensagens + CTAs em módulos sem dados
5. **Push integrado com agenda** — Alertas 30min antes
6. **Favicon dinâmico** — Nice-to-have

---

*Atualizado: 13 de Julho 2026*
