# Changelog — Hachi Platform

Todas as mudanças notáveis deste projeto serão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [0.2.0] — 2026-07-13

### Adicionado
- Multi-tenant completo com isolamento de dados por tenantId
- 8 verticais: Recovery, Clinic, Senior, Hotel, Restaurant, Education, Vet, Services
- Feature flags por vertical (sidebar e dashboard adaptam dinamicamente)
- Sistema de terminologia (labels adaptam por vertical)
- Portal Super Admin (/admin-platform)
- Onboarding self-service (/onboarding)
- 9 tenants demo criados
- APIs verticais (clinic/tiss, hotel/reservas, senior/medicacao, vet/vacinas, education/boletim, services/propostas)
- Páginas de formulário por vertical (anamnese, reservas, medicação, vacinas, boletim, propostas, timesheet, tarifas)
- Landing pages para todas as verticais com animações parallax
- Pipeline CRM (/crm)
- Sistema de notificações (/notifications)
- Billing foundation com trial de 14 dias
- Bloqueio de tenant quando trial expira
- Error boundaries com fallback UI
- Assinatura digital SHA-256 (Lei 14.063/2020)
- Geração automática de contrato ao cadastrar paciente com responsável
- Portal da Família com cadastro e dashboard
- White-label: branding por tenant (cores, logo)
- PWA com service worker

### Corrigido
- Login "Internal Server Error" (jose não aceita null no JWT payload)
- Isolamento de dados: todas 95+ API routes filtram por tenantId
- Role COORDENADOR sem acesso financeiro
- Sidebar mostra "Platform" em vez de "ERP"
- Terminologia adaptada por vertical em pacientes
- Reservas page data mapping
- CT Persev features corrigidas (removido PDV/delivery/reservas)

### Alterado
- Nome do produto: "Hachi ERP" → "Hachi Platform"
- Landing page principal reescrita com storytelling por vertical
- Dashboard adapta KPIs e cards por vertical

---

## [0.1.0] — 2026-07-02

### Adicionado
- Auth com JWT custom (jose) + bcrypt
- RBAC: ADMIN, PROFISSIONAL, RECEPCAO, MONITOR, COORDENADOR
- CRUD Pacientes com soft delete e validação Zod
- Prontuário: evoluções com assinatura digital, prescrições
- Agenda com detecção de conflito de horário
- Financeiro: movimentações + conta corrente por paciente
- Estoque: CRUD + movimentação entrada/saída + alertas de mínimo
- Quartos: mapa visual com status colorido
- Documentos: geração DOCX via docxtemplater (5 tipos)
- Comunicação: integração BotConversa (envio + webhook)
- Relatórios com exportação Excel
- Configurações: gestão de usuários, roles, dados da empresa
- Middleware de autenticação com rate limiting
- Audit log em todas operações de escrita
- Responsividade mobile completa
- 144 testes unitários passando

---

## [0.0.1] — 2026-07-01

### Adicionado
- Inicialização do projeto Next.js 15 + Prisma + PostgreSQL (Neon)
- Design system: shadcn/ui + Tailwind CSS
- Schema Prisma com 17 modelos
- CI/CD: GitHub Actions + Vercel auto-deploy
- Documentação inicial
