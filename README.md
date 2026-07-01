# 🐾 Hachi ERP

**Sistema integrado de gestão para clínicas de reabilitação em dependência química.**

Plataforma 100% web que cobre todo o fluxo operacional: prontuário eletrônico (SBIS/CFM), financeiro, agendamento, comunicação via WhatsApp (BotConversa), geração de documentos e relatórios gerenciais.

---

## 🏗️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15, React 19, shadcn/ui, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL |
| Auth | NextAuth.js v5, RBAC |
| Estado | Zustand (client), React Query (server) |
| Validação | Zod |
| Gráficos | Recharts |
| Integrações | BotConversa API, Pix BACEN, NF-e |

---

## 📦 Módulos

1. **Pacientes** — Cadastro, admissão, triagem
2. **Prontuário (PEP)** — Evoluções, prescrições, plano terapêutico
3. **Agenda** — Consultas, terapias, escalas
4. **Financeiro** — Conta corrente, Pix, NF-e, boletos
5. **Estoque** — Medicamentos, materiais, patrimônio
6. **Quartos** — Mapa de ocupação, check-in/out
7. **Documentos** — Contratos, receitas, atestados, recibos
8. **Comunicação** — WhatsApp via BotConversa, portal família
9. **Relatórios** — Dashboards, KPIs, BI
10. **Configurações** — Usuários, permissões, audit log

---

## 🔒 Compliance

- **LGPD** — Criptografia, consentimento, anonimização
- **CFM** — Prontuário certificável SBIS, assinatura eletrônica
- **ANVISA** — RDC 29/2011, controle sanitário
- **SISNAD** — Relatórios para políticas públicas
- **ISO 27001** — Segurança da informação

---

## 🚀 Setup Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar Prisma client
npx prisma generate

# Rodar migrations
npx prisma db push

# Seed de dados de teste
npx prisma db seed

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 🤖 Sub-Agentes de Desenvolvimento

| # | Agente | Responsabilidade |
|---|--------|-----------------|
| 01 | Architect | Arquitetura e decisões técnicas |
| 02 | Frontend | Interface e componentes |
| 03 | Backend | API routes e lógica de negócio |
| 04 | Database | Modelagem e otimização |
| 05 | Security | LGPD, RBAC, criptografia |
| 06 | Integrations | BotConversa, Pix, NF-e |
| 07 | Clinical | Prontuário e módulo clínico |
| 08 | Financial | Financeiro e faturamento |
| 09 | Admin | Administrativo e quartos |
| 10 | Communication | WhatsApp e portal família |
| 11 | Reports | Dashboards e BI |
| 12 | Documents | Geração de documentos |
| 13 | Testing | QA e testes automatizados |
| 14 | Reviewer | Verificador de qualidade |
| 15 | Critic | Crítico de produto/UX |

---

## 🎨 Design System

Baseado em **shadcn/ui** com tema customizado:

- **Primary**: Azul Petróleo (#0F4C5C) — confiança, saúde
- **Secondary**: Dourado Sutil (#D4A373) — acolhimento, calor
- **Radius**: 0.625rem (arredondamento suave)
- **Tipografia**: Inter (legibilidade)
- **Dark mode**: Suportado nativamente

---

## 📄 Licença

Proprietário — Persev Labs © 2026
