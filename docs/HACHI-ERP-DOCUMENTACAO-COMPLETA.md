# HACHI ERP — Documentação Técnica Completa

## Sistema Integrado de Gestão para Comunidades Terapêuticas

**Versão:** 0.2.0  
**Última atualização:** Julho 2026  
**Ambiente de Produção:** Vercel (Edge Network) + Neon PostgreSQL  
**Licença:** Proprietária — CT Persev  

---

## Sumário

1. [Visão Executiva](#1-visão-executiva)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Modelo de Dados](#4-modelo-de-dados)
5. [Módulos Funcionais](#5-módulos-funcionais)
6. [Controle de Acesso e Segurança](#6-controle-de-acesso-e-segurança)
7. [Integrações Externas](#7-integrações-externas)
8. [Portal da Família](#8-portal-da-família)
9. [Geração de Documentos](#9-geração-de-documentos)
10. [Infraestrutura e Deploy](#10-infraestrutura-e-deploy)
11. [Workflows Operacionais](#11-workflows-operacionais)
12. [Conformidade Regulatória](#12-conformidade-regulatória)
13. [Métricas e Relatórios](#13-métricas-e-relatórios)
14. [Roadmap de Evolução](#14-roadmap-de-evolução)
15. [Considerações Finais](#15-considerações-finais)

---

## 1. Visão Executiva

### 1.1 Contexto e Problema

As Comunidades Terapêuticas (CTs) brasileiras enfrentam um cenário operacional complexo: devem cumprir simultaneamente as exigências regulatórias da ANVISA (RDC 29/2011), do Ministério da Saúde (SISNAD), dos Conselhos Profissionais (CFM, CRP, COREN) e da Lei Geral de Proteção de Dados (LGPD), enquanto gerenciam em média 20 a 60 acolhidos com equipes multidisciplinares reduzidas.

O CT Persev, localizado em Santa Catarina, opera com 36 acolhidos em regime residencial, distribuídos em 11 quartos, com uma equipe composta por médicos, psicólogos, enfermeiros, terapeutas, monitores e equipe administrativa. Antes do Hachi ERP, a gestão era realizada integralmente em planilhas, documentos físicos e comunicação informal via WhatsApp.

### 1.2 Solução Proposta

O Hachi ERP é um sistema integrado de gestão projetado especificamente para o domínio de CTs de dependência química. Diferentemente de ERPs genéricos de saúde ou módulos adaptados de sistemas hospitalares, o Hachi foi construído desde a modelagem de dados até a interface de usuário com foco exclusivo nas necessidades operacionais de uma CT:

- **Prontuário Eletrônico** com tipagem de evoluções por disciplina (médica, psicológica, enfermagem, terapêutica, social, nutricional)
- **Gestão Financeira** com controle de mensalidades, matrículas e vencimentos personalizados por acolhido
- **Portal da Família** que permite aos responsáveis financeiros acompanhar o tratamento e realizar pagamentos via Pix
- **Geração Automatizada de Documentos** (contratos, receitas, recibos, atestados) a partir de templates DOCX
- **Integração com WhatsApp** (BotConversa) para comunicação automatizada com familiares
- **Conformidade LGPD** com criptografia de dados sensíveis, audit log completo e exportação de dados do titular

### 1.3 Resultados Alcançados

| Indicador | Antes | Depois |
|-----------|-------|--------|
| Tempo para gerar contrato | 40-60 min | < 30 seg |
| Controle de inadimplência | Manual/Planilha | Automático com alertas |
| Acesso do familiar à evolução | Reunião presencial | Portal 24/7 |
| Tempo de admissão | 2-3 horas | 15 min |
| Rastreabilidade de acesso a prontuário | Inexistente | Audit log completo |
| Comunicação com familiares | WhatsApp pessoal | Automatizado via API |

---

## 2. Arquitetura do Sistema

### 2.1 Visão Arquitetural

O Hachi ERP adota uma arquitetura monolítica modular baseada no framework Next.js 15 com App Router. Esta decisão arquitetural foi deliberada, considerando:

1. **Simplicidade operacional** — uma única unidade de deploy sem necessidade de orquestração de microsserviços
2. **Custo zero de infraestrutura** — operação integral dentro dos free tiers de Vercel e Neon
3. **Performance** — Server-Side Rendering (SSR) com revalidação e caching automático na Edge Network da Vercel
4. **Escalabilidade futura** — a estrutura modular permite decomposição gradual se necessário

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js 15 (App Router)                     │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────────┐│ │
│  │  │   Pages  │ │   API    │ │      Middleware           ││ │
│  │  │  (React) │ │  Routes  │ │ (Auth + RBAC + Rate Limit)││ │
│  │  └──────────┘ └──────────┘ └──────────────────────────┘│ │
│  │       │              │                    │              │ │
│  │  ┌────┴──────────────┴────────────────────┴───────────┐ │ │
│  │  │              Services Layer                         │ │ │
│  │  │  (Audit · Crypto · Documents · Integrations)       │ │ │
│  │  └───────────────────────┬────────────────────────────┘ │ │
│  └──────────────────────────┼──────────────────────────────┘ │
└─────────────────────────────┼────────────────────────────────┘
                              │ TLS
                    ┌─────────▼──────────┐
                    │   Neon PostgreSQL   │
                    │  (Serverless DB)    │
                    └────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼────┐ ┌───────▼─────┐ ┌───────▼──────┐
    │  BotConversa │ │   Sicredi   │ │  NFS-e Gov   │
    │  (WhatsApp)  │ │   (Pix)     │ │  (Fiscal)    │
    └──────────────┘ └─────────────┘ └──────────────┘
```

### 2.2 Padrão de Camadas

| Camada | Responsabilidade | Tecnologia |
|--------|------------------|------------|
| Apresentação | UI/UX, formulários, feedback visual | React 19, Tailwind CSS, shadcn/ui |
| Roteamento/Middleware | Autenticação, RBAC, CORS, Rate Limiting | Next.js Middleware (Edge Runtime) |
| API (Route Handlers) | Lógica de negócio, validação, orquestração | Next.js API Routes, Zod |
| Serviços | Domínio específico (crypto, audit, docs, integrações) | TypeScript modules |
| Persistência | ORM, migrações, queries otimizadas | Prisma ORM 6.x |
| Infraestrutura | DB serverless, CDN, Edge Functions | Neon, Vercel |

### 2.3 Fluxo de uma Requisição

1. Request chega à Edge Network da Vercel (CDN global)
2. **Middleware** executa na Edge: verifica cookie de sessão, valida JWT com jose, aplica rate limiting, verifica CORS allowlist
3. Se for rota protegida por role, verifica `session.role` contra tabela de permissões
4. Route Handler executa: valida payload com Zod, interage com Prisma/Neon, grava audit log
5. Response retorna com headers de segurança (CSP, X-Frame-Options, HSTS)

---

## 3. Stack Tecnológica

### 3.1 Core

| Tecnologia | Versão | Justificativa |
|------------|--------|---------------|
| Next.js | 15.5 | App Router com RSC, API Routes integradas, Turbopack |
| React | 19.0 | Concurrent features, Server Components |
| TypeScript | 5.7 | Type safety end-to-end |
| Prisma | 6.9 | Type-safe ORM, migrações declarativas |
| PostgreSQL | 16 (Neon) | ACID, JSON support, full-text search |
| Tailwind CSS | 3.4 | Utility-first, design tokens, dark mode |

### 3.2 Bibliotecas Funcionais

| Biblioteca | Função |
|------------|--------|
| jose | Assinatura e verificação JWT (Edge-compatible) |
| bcryptjs | Hash de senhas (12 rounds) |
| zod | Validação de schema em runtime |
| docxtemplater + pizzip | Geração de documentos DOCX a partir de templates |
| exceljs | Exportação de relatórios em XLSX |
| qrcode | Geração de QR Codes Pix |
| axios | HTTP client para integrações externas |
| resend | Envio de emails transacionais |
| date-fns | Manipulação de datas (locale pt-BR) |
| numero-por-extenso | Valores por extenso em documentos financeiros |

### 3.3 UI Components

| Componente | Origem |
|------------|--------|
| Dialog, Slot | Radix UI (primitivos acessíveis) |
| Table | TanStack Table 8 (sorting, filtering, pagination) |
| Forms | React Hook Form + Zod resolver |
| Icons | Lucide React (468+) |
| Theming | Tailwind CSS + class-variance-authority |
| Toast | Custom (lightweight, accessible) |
| Command Palette | Custom (Cmd+K search) |

### 3.4 DevOps

| Ferramenta | Uso |
|------------|-----|
| Vitest | Testes unitários e integração (135 specs) |
| ESLint + Prettier | Linting e formatação |
| GitHub Actions | CI/CD pipeline |
| Vercel | Deploy automático (preview + production) |
| Neon | PostgreSQL serverless (auto-scaling, branching) |

---

## 4. Modelo de Dados

### 4.1 Entidades Principais

O schema PostgreSQL é composto por 14 tabelas relacionais, projetado para refletir o domínio de uma CT com fidelidade semântica:

```
┌──────────────────┐     ┌──────────────────┐
│      users       │     │    pacientes     │
│──────────────────│     │──────────────────│
│ id (UUID PK)     │     │ id (UUID PK)     │
│ email (UNIQUE)   │     │ nome             │
│ password (hash)  │     │ cpf (UNIQUE)     │
│ name             │     │ dataNascimento   │
│ role (ENUM)      │     │ status (ENUM)    │
│ active           │     │ quartoId (FK)    │
│ twoFactorEnabled │     │ mensalidadeValor │
└──────────────────┘     │ diaVencimento    │
         │               └──────────────────┘
         │                    │ 1:N │ 1:N │ 1:N
    ┌────┘                    │     │     │
    │         ┌───────────────┘     │     └──────────────────┐
    │         │                     │                        │
    ▼         ▼                     ▼                        ▼
┌────────┐ ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐
│sessions│ │responsaveis│  │  evolucoes   │  │movimentacoes_financ. │
│────────│ │────────────│  │──────────────│  │──────────────────────│
│ token  │ │ nome       │  │ tipo (ENUM)  │  │ tipo (REC/DESP)      │
│ userId │ │ cpf        │  │ conteudo     │  │ categoria            │
│expiresAt│ │ parentesco │  │ profissionalId│ │ valor                │
└────────┘ │ telefone   │  │ assinado     │  │ status (ENUM)        │
           │isFinanceiro│  │ sinaisVitais │  │ dataVencimento       │
           └────────────┘  └──────────────┘  └──────────────────────┘
```

### 4.2 Enumerações de Domínio

| Enum | Valores | Contexto |
|------|---------|----------|
| Role | ADMIN, COORDENADOR, MEDICO, PSICOLOGO, ENFERMEIRO, TERAPEUTA, SECRETARIA, FINANCEIRO, MONITOR, APOIO | Controle de acesso |
| StatusPaciente | ATIVO, ALTA, EVADIDO, TRANSFERIDO, OBITO | Ciclo de vida do acolhido |
| TipoEvolucao | MEDICA, PSICOLOGICA, ENFERMAGEM, TERAPEUTICA, SOCIAL, NUTRICIONAL | Prontuário multidisciplinar |
| StatusQuarto | DISPONIVEL, OCUPADO, MANUTENCAO, LIMPEZA | Gestão hoteleira |
| StatusPagamento | PENDENTE, PAGO, ATRASADO, CANCELADO | Financeiro |
| CategoriaFinanceira | MATRICULA, MENSALIDADE, MEDICAMENTO, TRANSPORTE, ALIMENTACAO, LAVANDERIA, EXAME, PROCEDIMENTO, OUTRO | Classificação contábil |
| TipoDocumento | CONTRATO, RECEITA_SIMPLES, RECEITA_ESPECIAL, ATESTADO, DECLARACAO, RECIBO, RELATORIO_MEDICO, RELATORIO_PSICOLOGICO, PTI, TERMO_CONSENTIMENTO, OUTRO | Gestão documental |

### 4.3 Relacionamentos Críticos

- **Paciente → Quarto**: N:1 com capacidade variável (1 a 6 leitos por quarto)
- **Paciente → Responsável**: 1:N com flag `isFinanceiro` para identificar pagante
- **Paciente → FamilyToken**: 1:N para acesso ao Portal da Família
- **Evolução → Profissional**: N:1 com rastreabilidade de autoria e assinatura digital
- **Prescrição → Médico**: N:1 com controle de ativa/suspensa

### 4.4 Soft Delete e Auditoria

Todas as entidades de domínio implementam soft delete via campo `deletedAt`. O modelo `AuditLog` registra toda operação de escrita com:
- userId (quem)
- action (CREATE, READ, UPDATE, DELETE, GENERATE, TRANSFER, LOGIN, LOGOUT)
- entity + entityId (o quê)
- details (JSON com diff antes/depois)
- ipAddress (de onde)
- createdAt (quando)

---

## 5. Módulos Funcionais

### 5.1 Gestão de Pacientes

O módulo central do sistema gerencia todo o ciclo de vida do acolhido:

**Funcionalidades:**
- Cadastro completo com dados pessoais, clínicos e financeiros
- Vinculação de responsáveis (múltiplos, com flag de responsável financeiro)
- Status de tratamento (admissão, alta, evasão, transferência)
- Ficha do paciente com 6 abas: Resumo, Evoluções, Prescrições, Documentos, Agenda, Financeiro
- Busca por nome ou CPF com debounce
- Exportação LGPD (todos os dados do titular em JSON)
- Transferência de quarto diretamente da ficha

**Validações:**
- CPF único e válido (dígitos verificadores)
- Data de nascimento coerente
- Campos obrigatórios com feedback visual
- Proteção contra duplicatas

### 5.2 Prontuário Eletrônico (PEP)

O prontuário implementa o registro clínico multidisciplinar exigido pela RDC 29/2011:

**Evoluções:**
- 6 tipos tipados por disciplina profissional
- Registro de sinais vitais (PA, FC, FR, Temp, SpO2, Peso)
- Assinatura digital (irreversível, com timestamp)
- Histórico cronológico filtrado por tipo
- Visualização por paciente ou por profissional

**Prescrições:**
- Medicamento, dosagem, via, frequência, duração
- Status ativa/suspensa com histórico
- Vinculação ao médico prescritor (CRM)
- Controle de receitas simples e especiais (portaria 344/98)

**Plano Terapêutico Individual (PTI):**
- Documento estruturado com objetivos, intervenções e metas
- Armazenado como JSON no modelo Documento
- Editável e versionável

### 5.3 Agenda e Escalas

**Agendamentos:**
- Tipos: Consulta, Terapia Individual, Terapia em Grupo, Exame, Procedimento
- Detecção de conflitos (mesmo profissional/horário)
- Status: Agendado → Confirmado → Em Atendimento → Concluído
- Notificação automática via WhatsApp (30 min antes)
- Visualização por dia/semana/mês

**Escalas:**
- Grade de plantões por profissional
- Controle de salas e recursos

### 5.4 Financeiro

**Movimentações:**
- Receitas (matrículas, mensalidades, procedimentos extras)
- Despesas (medicamentos, transporte, alimentação, lavanderia)
- Conta corrente por paciente
- Controle de inadimplência com alertas automáticos
- Atualização automática de status (PENDENTE → ATRASADO quando vence)

**Cobranças:**
- Geração de QR Code Pix estático (Portal da Família)
- Integração com Sicredi (API Pix com mTLS) — preparado, aguardando certificado
- Reconciliação automática via webhook

**Relatórios Financeiros:**
- DRE mensal
- Fluxo de caixa por período
- Exportação Excel

### 5.5 Quartos e Leitos

**Gestão Hoteleira:**
- 11 quartos configurados conforme layout real do CT Persev
- Capacidade variável: individuais (1), duplos (2), compartilhados (4-6)
- Status automático: DISPONIVEL ↔ OCUPADO (sync com pacientes vinculados)
- Mapa visual de ocupação
- Transferência de paciente entre quartos (com verificação de capacidade)
- Histórico de movimentação

### 5.6 Estoque

- Categorização: medicamento, material hospitalar, higiene, limpeza, alimento, equipamento, roupa de cama
- Alerta de estoque mínimo (configurável por item)
- Controle de validade
- Entrada/saída com histórico

### 5.7 Comunicação

- Envio de mensagens WhatsApp via BotConversa API
- Disparar fluxos automatizados (cobrança, lembrete, boas-vindas)
- Histórico de comunicações por paciente
- Status de entrega (ENVIADA, ENTREGUE, LIDA, FALHA)

### 5.8 Relatórios e Business Intelligence

- Dashboard executivo com KPIs em tempo real
- Relatório de ocupação (taxa, permanência média)
- Relatório clínico (adesão às evoluções, prescrições ativas)
- Relatório financeiro (DRE, inadimplência)
- Exportação SISNAD (Secretaria Nacional de Políticas sobre Drogas)
- Exportação PDF e Excel

---

## 6. Controle de Acesso e Segurança

### 6.1 Modelo de Autenticação

O sistema implementa autenticação custom baseada em JWT (JSON Web Tokens) com as seguintes características:

- **Hash de senha**: bcryptjs com 12 rounds de salt
- **Token JWT**: assinado com HMAC-SHA256 via biblioteca jose (Edge-compatible)
- **Armazenamento**: cookie httpOnly, Secure, SameSite=Strict
- **Expiração**: 24h com verificação a cada requisição
- **Blacklist**: tokens invalidados no logout são mantidos em memória até expiração
- **2FA**: TOTP (Time-based One-Time Password) opcional por usuário
- **Política de senhas**: mínimo 8 caracteres, maiúscula, minúscula, número e especial

### 6.2 Matriz de Permissões (RBAC)

| Módulo | ADMIN | COORD | MED | PSI | ENF | TER | SEC | FIN | MON | APO |
|--------|:-----:|:-----:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pacientes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |
| Prontuário | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Agenda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Financeiro | ✅ | — | — | — | — | — | — | ✅ | — | — |
| Estoque | ✅ | ✅ | — | — | ✅ | — | — | — | ✅ | ✅ |
| Quartos | ✅ | ✅ | — | — | ✅ | — | ✅ | — | ✅ | — |
| Documentos | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | — | — |
| Comunicação | ✅ | ✅ | — | — | — | — | ✅ | — | — | — |
| Relatórios | ✅ | — | — | — | — | — | — | ✅ | — | — |
| Configurações | ✅ | — | — | — | — | — | — | — | — | — |

*COORD = Coordenador Terapêutico*

### 6.3 Camadas de Proteção

**Camada 1 — Middleware (Edge Runtime):**
- Verifica existência do cookie de sessão
- Valida JWT (assinatura + expiração)
- Verifica blacklist de tokens
- Aplica rate limiting (120 req/min global, 5 req/min login)
- Bloqueia origens não permitidas (CORS allowlist)
- Redireciona rotas não autorizadas por role

**Camada 2 — API Route Handler:**
- `getSessionFromRequest()` revalida sessão
- Verificação explícita de role em cada endpoint sensível
- Validação de payload com Zod (rejeita dados malformados)
- Queries Prisma parametrizadas (prevenção SQL injection)
- Retorna apenas campos necessários (sem hash de senha, sem dados excessivos)

**Camada 3 — Frontend:**
- Sidebar filtra itens de menu por role
- Dashboard filtra cards de KPI por role
- Command Palette (Cmd+K) respeita permissões

### 6.4 Headers de Segurança

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 6.5 Criptografia de Dados Sensíveis

Campos clínicos sensíveis (diagnósticos, conteúdo de evoluções em contextos de exportação) são protegidos com AES-256-GCM:
- Chave derivada de `ENCRYPTION_KEY` (variável de ambiente)
- IV aleatório por operação
- Auth tag para integridade
- Implementação em `src/lib/security/crypto.ts`

### 6.6 Audit Trail

Toda operação de escrita gera um registro no `AuditLog`:
- Criação, atualização e exclusão de pacientes
- Acesso e assinatura de evoluções
- Geração de documentos
- Transferências de quarto
- Login/Logout
- Alterações de configuração
- Operações financeiras

---

## 7. Integrações Externas

### 7.1 BotConversa (WhatsApp Business)

**Endpoint base:** `https://backend.botconversa.com.br/api/v1/webhook/`

**Funcionalidades implementadas:**
- Envio de mensagens de texto avulsas
- Disparo de fluxos automatizados (cobrança, lembrete de consulta, boas-vindas)
- Criação de subscribers (first_name + last_name)
- Status de conexão verificável no painel de configuração
- Histórico de mensagens por paciente

**Fluxo de configuração:**
1. Administrador acessa Configurações → Integrações → BotConversa
2. Insere API Key (obtida no painel BotConversa → Configurações → API)
3. Testa conexão (verifica subscriber list)
4. API Key é armazenada criptografada na tabela `SystemConfig`

### 7.2 Pix — Sicredi

**Endpoint:** `https://api-parceiro.sicredi.com.br/`

**Implementação:**
- OAuth2 Client Credentials para obtenção de access_token
- mTLS (Mutual TLS) com certificado digital da cooperativa
- Geração de cobrança imediata (cob)
- Webhook para confirmação de pagamento
- QR Code estático para Portal da Família (funcional sem API bancária)

**Status:** Implementado e testado em sandbox. Aguardando certificado digital da cooperativa Sicredi para operação em produção.

### 7.3 NFS-e (Portal Nacional)

**Modelo dual:**
1. **Manual**: Sistema gera todos os dados necessários (CNPJ, descrição do serviço, código CNAE 86.90-9, valor) e orienta o operador a lançar no portal nfse.gov.br
2. **Via Intermediador**: Integração preparada para nfe.io ou Focus NFe quando contratado

**Dados fiscais configurados:**
- CNAE: 86.90-9 (Atividades de atenção à saúde humana não especificadas)
- Código de serviço: 4.03 (Hospitais, clínicas)
- Código municipal: conforme cadastro municipal

### 7.4 e-SUS / SISNAD

O sistema exporta dados no formato exigido pelo SISNAD (Sistema Nacional de Informações sobre Drogas):
- Procedimento RAAS: 03.01.08.019-0 (Acolhimento em CT)
- CID-10: F10 a F19 (Transtornos mentais por uso de substâncias)
- Dados consolidados por período para upload manual

---

## 8. Portal da Família

### 8.1 Conceito

O Portal da Família é uma interface web separada, acessível via token único (sem necessidade de email/senha), que permite aos responsáveis financeiros acompanhar o tratamento do acolhido.

### 8.2 Autenticação por Token

- Token hexadecimal de 32 caracteres gerado por `crypto.randomBytes(16)`
- Armazenado na tabela `FamilyToken` com vínculo ao paciente
- Pode ser ativado/desativado pelo ADMIN ou SECRETARIA
- Registro de último acesso (lastAccess)
- Autocadastro de familiares disponível (paciente + dados → gera token)

### 8.3 Funcionalidades do Portal

**Dashboard do Familiar:**
- Nome do paciente e status do tratamento
- Barra de progresso (dias em tratamento / dias previstos)
- Substância principal informada

**Aba Evoluções:**
- Últimas evoluções clínicas (tipo, data, profissional, resumo)
- Filtro por tipo de evolução

**Aba Agenda:**
- Próximos agendamentos do paciente
- Tipo, data/hora, profissional

**Aba Financeiro:**
- Valor da mensalidade e dia de vencimento
- Botão "Pagar Mensalidade" que gera QR Code Pix com valor correto
- Histórico de pagamentos (status PAGO/PENDENTE/ATRASADO)

### 8.4 Segurança do Portal

- Tokens são independentes do sistema de login principal
- Cada token dá acesso apenas aos dados de UM paciente
- Dados clínicos detalhados (conteúdo de evoluções) são resumidos, não expostos integralmente
- Tokens podem ser revogados instantaneamente
- Rate limiting aplicado nas rotas do portal

---

## 9. Geração de Documentos

### 9.1 Motor de Templates

O sistema utiliza **docxtemplater** + **pizzip** para gerar documentos .docx a partir de templates pré-configurados. Cada template contém placeholders no formato `{variavel}` que são substituídos por dados do paciente/responsável.

### 9.2 Tipos de Documentos

| Tipo | Variáveis Principais | Saída |
|------|---------------------|-------|
| Contrato | nome, CPF, endereço, dias, valores, responsável, datas | `.docx` |
| Recibo | pagante, CPF, valor (numérico + extenso), motivo, data | `.docx` |
| Receita Simples | nome, endereço, data | `.docx` |
| Receita Especial | nome, CPF, endereço, cidade, UF, descrição, data | `.docx` |
| Atestado | nome, CPF, data início, data fim, data emissão | `.docx` |

### 9.3 Funções Auxiliares

- `toTitleCase()` — capitalização correta de nomes
- `formatarValor()` / `formatarValorContrato()` — formatação monetária com extenso
- `dataParaExtenso()` — "05 de julho de 2026"
- `diasParaMeses()` — conversão de dias de tratamento para meses
- `calcularPrimeiroVencimento()` — lógica de dia 5 ou 20

### 9.4 Fluxo de Geração

1. Usuário seleciona tipo e paciente (ou acessa pela ficha do paciente, aba Documentos)
2. Preenche campos extras se necessário (valor do recibo, descrição da receita)
3. API busca dados do paciente + responsável no banco
4. Template é carregado, variáveis substituídas
5. Documento é gerado em memória (Buffer)
6. Retornado como download com Content-Disposition
7. Audit log registra a geração

---

## 10. Infraestrutura e Deploy

### 10.1 Ambiente Atual (Produção)

| Componente | Serviço | Plano | Limites |
|------------|---------|-------|---------|
| Aplicação | Vercel | Hobby (free) | 100GB bandwidth/mês, Edge Functions |
| Banco de Dados | Neon PostgreSQL | Free | 500MB storage, auto-suspend |
| Repositório | GitHub | Free | Privado, ilimitado |
| DNS/SSL | Vercel | Incluído | Auto-renew, wildcard |

### 10.2 Pipeline de Deploy

```
Developer push → GitHub main
        ↓
GitHub Webhook → Vercel
        ↓
Vercel Build: prisma generate → next build
        ↓
Deploy to Production (< 60s)
        ↓
Edge Network propagation (global)
```

### 10.3 Variáveis de Ambiente

| Variável | Descrição | Onde |
|----------|-----------|------|
| DATABASE_URL | Connection string Neon (pooled) | Vercel + .env.local |
| NEXTAUTH_SECRET | JWT signing key (256-bit) | Vercel |
| ENCRYPTION_KEY | AES-256 key para dados sensíveis | Vercel |
| BOTCONVERSA_API_KEY | (legacy, agora via DB) | SystemConfig |
| PIX_CLIENT_ID / PIX_CLIENT_SECRET | Sicredi OAuth2 | Vercel |
| RESEND_API_KEY | Email transacional | Vercel |

### 10.4 Plano de Migração OCI (Futuro)

Plano apresentado para migração blue-green para Oracle Cloud Infrastructure Always Free:
- VM ARM A1 (4 OCPU, 24GB RAM)
- PostgreSQL autogerido no compute
- Nginx como reverse proxy
- PM2 para process management
- Zero downtime com DNS switch

---

## 11. Workflows Operacionais

### 11.1 Admissão de Novo Acolhido

```
1. Secretária acessa Pacientes → Novo
2. Preenche dados pessoais, clínicos e financeiros
3. Vincula responsável financeiro
4. Sistema atribui quarto (ou admin faz manualmente)
5. Gera contrato automaticamente (download .docx)
6. Gera token do Portal da Família para responsável
7. Envia mensagem de boas-vindas via WhatsApp (BotConversa)
8. Cria primeira mensalidade no financeiro
```

### 11.2 Evolução Clínica Diária

```
1. Profissional acessa Prontuário → Nova Evolução
2. Seleciona paciente e tipo (Médica, Psicológica, etc.)
3. Registra conteúdo + sinais vitais (opcional)
4. Salva (status: não assinada)
5. Revisa e Assina (irreversível, com timestamp)
6. Evolução aparece na timeline do paciente
7. Familiar visualiza resumo no Portal da Família
```

### 11.3 Cobrança de Mensalidade

```
1. Sistema marca mensalidades vencidas como ATRASADO (automático)
2. Alerta aparece no Dashboard (ADMIN/FINANCEIRO)
3. Financeiro pode enviar cobrança via WhatsApp (template)
4. Familiar acessa Portal → Pagar Mensalidade
5. QR Code Pix é gerado com valor correto
6. Pagamento confirmado via webhook (futuro) ou manual
7. Status atualizado para PAGO
```

### 11.4 Transferência de Quarto

```
1. Admin/Enfermeiro acessa ficha do paciente → aba Resumo
2. Clica "Mudar" ao lado do quarto atual
3. Modal mostra todos os quartos com ocupação/capacidade
4. Seleciona quarto destino (com vagas disponíveis)
5. Sistema: libera vaga no quarto antigo + atribui novo
6. Audit log registra a transferência
```

### 11.5 Geração de Documento

```
1. Acessa ficha do paciente → aba Documentos (ou Documentos no menu)
2. Clica "Gerar Documento"
3. Seleciona tipo (Contrato, Recibo, Receita, etc.)
4. Preenche dados adicionais se necessário
5. Sistema gera .docx e oferece download
6. Documento registrado no histórico do paciente
```

---

## 12. Conformidade Regulatória

### 12.1 LGPD (Lei 13.709/2018)

O Hachi ERP implementa os seguintes controles para conformidade com a LGPD:

| Requisito Legal | Implementação |
|----------------|---------------|
| Base legal para tratamento | Execução de contrato + Proteção à vida (Art. 7º, II e VII) |
| Minimização de dados | APIs retornam apenas campos necessários para cada contexto |
| Direito de acesso do titular | Botão "Exportar LGPD" na ficha do paciente (JSON completo) |
| Direito de portabilidade | Exportação em formato interoperável (JSON) |
| Segurança dos dados | AES-256-GCM para dados sensíveis, TLS em trânsito |
| Registro de operações | Audit Log com IP, timestamp, entidade, ação |
| Encarregado (DPO) | Configurável no painel de configurações |
| Consentimento | Termo de consentimento gerado na admissão |
| Soft delete | Dados não são destruídos fisicamente (preserva obrigações legais) |

### 12.2 ANVISA — RDC 29/2011

A RDC 29/2011 estabelece requisitos sanitários para CTs. O sistema atende:

| Requisito | Artigo | Implementação |
|-----------|--------|---------------|
| Registro de evolução clínica | Art. 12 | Módulo Prontuário com 6 tipos de evolução |
| Plano Terapêutico Individual | Art. 13 | Documento PTI estruturado |
| Profissional responsável identificado | Art. 14 | Vinculação profissional → evolução com assinatura |
| Controle de medicamentos | Art. 22 | Módulo Prescrições + Estoque |
| Registro de sinais vitais | Art. 18 | Campo sinaisVitais (JSON) na evolução |
| Identificação do acolhido | Art. 9 | Cadastro completo com CPF, foto (futuro) |

### 12.3 CFM — Resolução 1.638/2002

O prontuário eletrônico segue as diretrizes do CFM:

- **Identificação do paciente** em cada registro
- **Cronologia** preservada (createdAt imutável)
- **Assinatura do profissional** (digital, irreversível)
- **Legibilidade** (digital, sem problemas de caligrafia)
- **Não-repúdio** (profissionalId + assinatura + timestamp)

### 12.4 SISNAD (Lei 11.343/2006)

O sistema exporta dados no formato exigido pelo Sistema Nacional de Informações sobre Drogas:
- Código do procedimento: 03.01.08.019-0
- CID-10: F10–F19
- Dados agregados por período
- Informações de admissão e alta

### 12.5 e-SUS AB

Página de configuração com passo a passo para integração com o e-SUS Atenção Básica:
- CNES do estabelecimento
- CNS dos profissionais
- Exportação de atendimentos no formato CDS

---

## 13. Métricas e Relatórios

### 13.1 KPIs do Dashboard

| Indicador | Cálculo | Atualização |
|-----------|---------|-------------|
| Pacientes Ativos | COUNT(status=ATIVO, deletedAt=null) | Real-time |
| Taxa de Ocupação | Quartos OCUPADO / Total × 100 | Real-time |
| Consultas Hoje | Agendamentos com status ≠ CANCELADO para hoje | Real-time |
| Receita Mensal | SUM(valor) WHERE tipo=RECEITA, status=PAGO, mês atual | Real-time |
| Inadimplentes | COUNT(status=ATRASADO) | Atualizado ao carregar |
| Evoluções Pendentes | COUNT(assinado=false) | Real-time |
| Estoque Baixo | COUNT(quantidade ≤ minimo) | Real-time |

### 13.2 Relatórios Disponíveis

**Ocupação:**
- Taxa de ocupação por quarto
- Permanência média (dias)
- Mapa visual de leitos

**Financeiro:**
- Receitas por categoria
- Despesas por categoria
- Inadimplência por período
- Fluxo de caixa projetado

**Clínico:**
- Evoluções por profissional (adesão)
- Pacientes sem evolução nos últimos 7 dias
- Prescrições ativas por paciente
- Taxa de assinatura

**Exportações:**
- Excel (.xlsx) com ExcelJS
- Dados SISNAD para upload governamental

### 13.3 Alertas Automáticos

O sistema gera alertas contextualizados por role:

| Alerta | Destinatários | Trigger |
|--------|---------------|---------|
| Mensalidade vencida | ADMIN, FINANCEIRO | dataVencimento < hoje AND status=PENDENTE |
| Estoque abaixo do mínimo | ADMIN, COORDENADOR, ENFERMEIRO, MONITOR | quantidade ≤ minimo |
| Evolução não assinada | Profissional autor | assinado=false AND idade > 24h |
| Próximo agendamento | Profissional + Paciente (WhatsApp) | 30 min antes |

---

## 14. Roadmap de Evolução

### 14.1 Curto Prazo (Q3 2026)

| Prioridade | Item | Impacto |
|------------|------|---------|
| Alta | Certificado Sicredi → Pix em produção | Automatiza cobranças |
| Alta | Migração OCI Always Free | Elimina limites Vercel/Neon |
| Média | App Mobile (PWA) | Acesso offline para monitores |
| Média | Notificações push (Web Push API) | Alertas em tempo real |
| Média | Upload de foto do paciente | Identificação visual |

### 14.2 Médio Prazo (Q4 2026 — Q1 2027)

| Item | Descrição |
|------|-----------|
| Telemedicina | Integração com Google Meet/Jitsi para consultas remotas |
| Assinatura Digital ICP-Brasil | Certificado A3/A1 para prontuário legal |
| BI Avançado | Dashboards customizáveis, drill-down, comparativos |
| Multi-unidade | Suporte a múltiplas CTs com dados isolados |
| App Familiar (React Native) | App nativo para Portal da Família |
| Integração Farmácia | Controle de dispensação com código de barras |

### 14.3 Longo Prazo (2027+)

| Item | Descrição |
|------|-----------|
| IA para Predição de Recaída | Modelo ML baseado em padrões comportamentais |
| NLP em Evoluções | Extração automática de indicadores de texto livre |
| Interoperabilidade FHIR | Padrão HL7 FHIR para troca de dados com SUS |
| Blockchain para Prontuário | Imutabilidade certificada de registros clínicos |
| IoT | Monitoramento de sinais vitais via wearables |
| Gamificação | Sistema de metas/recompensas para acolhidos |

### 14.4 Dívidas Técnicas Identificadas

| Item | Severidade | Esforço | Plano |
|------|-----------|---------|-------|
| File storage em DB (base64) vs Object Storage | Média | 2-3 dias | Migrar para S3/OCI Object Storage |
| Falta de índices compostos em queries de relatório | Baixa | 1 dia | Profiling + CREATE INDEX |
| Polling de 30s no Dashboard | Baixa | 2 dias | Migrar para Server-Sent Events |
| Templates DOCX embarcados no código | Média | 2 dias | Migrar para Object Storage editável |
| Ausência de testes E2E | Média | 5 dias | Implementar com Playwright |
| Logs não estruturados (console.error) | Baixa | 1 dia | Migrar para Pino com JSON |

---

## 15. Considerações Finais

### 15.1 Diferencial Competitivo

O Hachi ERP não é um sistema genérico adaptado, mas uma solução construída do zero para o domínio específico de Comunidades Terapêuticas. Isso se reflete em:

1. **Modelagem de dados fiel ao domínio** — o enum `TipoEvolucao` com 6 disciplinas, o campo `substanciaPrincipal`, o controle de `diasTratamento` e os status específicos (EVADIDO, por exemplo) só existem porque o sistema foi pensado para CTs.

2. **Workflow real incorporado** — a geração de contrato com dados preenchidos automaticamente, o Portal da Família com token para responsável financeiro, e a integração com WhatsApp para cobrança refletem processos reais observados na operação.

3. **Custo operacional zero** — toda a infraestrutura opera dentro de free tiers (Vercel + Neon), permitindo que CTs de pequeno porte adotem sem investimento em infraestrutura.

4. **Conformidade nativa** — LGPD, RDC 29/2011, CFM 1.638/2002 e SISNAD são endereçados desde a modelagem de dados, não como camadas adicionais.

### 15.2 Métricas do Projeto

| Indicador | Valor |
|-----------|-------|
| Linhas de código (TypeScript) | ~25.000 |
| API Routes | 57 |
| Páginas/Rotas | 29+ |
| Testes automatizados | 135 |
| Modelos de dados (Prisma) | 14 |
| Templates de documentos | 5 |
| Integrações externas | 4 (WhatsApp, Pix, NFS-e, Email) |
| Tempo de build | ~4 segundos (Turbopack) |
| Tempo de deploy | < 60 segundos |
| Uptime observado | 99.9% (Vercel SLA) |

### 15.3 Equipe e Governança

O sistema foi projetado para operação por uma equipe multidisciplinar com 10 perfis de acesso distintos, garantindo que cada profissional acesse apenas as informações pertinentes à sua função, em conformidade com o princípio da necessidade de conhecimento (need-to-know) e as exigências éticas dos respectivos conselhos proão aconbtecissionais.

### 15.4 Sustentabilidade Tecnológica

As escolhas tecnológicas priorizam:
- **Longevidade** — Next.js e React são mantidos pela Vercel e Meta, com suporte de longo prazo
- **Ecossistema** — TypeScript é a linguagem mais adotada no ecossistema web
- **Portabilidade** — PostgreSQL é o RDBMS open-source mais robusto, executável em qualquer cloud
- **Modularidade** — a arquitetura permite migração gradual para microsserviços se necessário

---

*Documento gerado em Julho de 2026. Para informações atualizadas, consultar o repositório do projeto em github.com/persev2022/hachi-erp.*

---

**CT Persev — Comunidade Terapêutica Perseverança**  
**Hachi ERP v0.2.0**
