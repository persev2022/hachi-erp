# Guia Completo — Hachi Platform
## Para: Marquinhos (CS, Onboarding, Suporte & Apresentações)

> Última atualização: Julho 2026
> Este documento é seu mapa completo do sistema. Use como referência diária.

---

## O QUE É A HACHI PLATFORM

A Hachi é um **Business Operating System** — um sistema operacional de negócios que serve **8 verticais de mercado** a partir de uma única base tecnológica:

| Vertical | Para quem | Exemplo de cliente |
|----------|-----------|-------------------|
| **Recovery** | Comunidades Terapêuticas, clínicas de reabilitação | CT Persev (nosso primeiro) |
| **Clinic** | Clínicas médicas, odonto, fisio, psicologia | Clínica São Lucas |
| **Senior** | Casas de repouso, ILPIs | Residencial Vida Plena |
| **Hotel** | Hotéis, pousadas, hostels | Pousada Mar Azul |
| **Restaurant** | Restaurantes, bares, pizzarias, dark kitchens | Bistrô da Praça |
| **Education** | Escolas, cursos, instituições | Colégio Futuro |
| **Vet** | Clínicas veterinárias, pet shops | PetVida Clínica |
| **Services** | Agências, consultorias, escritórios | Agência Digital XYZ |

### Frase-chave para apresentações:
> "Uma plataforma. Infinitas verticais de negócio."

---

## COMO FUNCIONA (para explicar ao cliente)

### Os 4 Pilares

1. **Operar** — Organiza o dia a dia (agenda, cadastros, prontuário)
2. **Controlar** — Visibilidade total (financeiro, estoque, relatórios)
3. **Integrar** — Conecta tudo (WhatsApp, Pix, NFS-e, portal)
4. **Evoluir** — A mesma base serve vários mercados

### Arquitetura em Camadas (para apresentações técnicas)

```
HACHI PLATFORM
├── Core Engine (segurança, auth, multi-tenant, API, audit)
├── Business OS (financeiro, CRM, agenda, docs, automação, BI)
├── Vertical Packs (módulos específicos por mercado)
└── Portais (admin, equipe, cliente/família, mobile)
```

---

## ACESSO AO SISTEMA

### URLs Importantes

| O quê | URL |
|-------|-----|
| Sistema (produção) | https://hachi-erp.vercel.app |
| Login | https://hachi-erp.vercel.app/login |
| Onboarding (criar conta) | https://hachi-erp.vercel.app/onboarding |
| Super Admin | https://hachi-erp.vercel.app/admin-platform |
| Landing Principal | https://hachi-erp.vercel.app/landing |
| API Docs | https://hachi-erp.vercel.app/api/platform/docs |
| Portal da Família | https://hachi-erp.vercel.app/portal-familia |

### Credenciais de Demo

| Vertical | Email | Senha | O que vê |
|----------|-------|-------|----------|
| Recovery (produção) | admin@hachi.com | Admin@2026 | Tudo + Platform |
| Clinic Demo | admin@clinic-demo.com | Clinic@2026 | Módulos clínica |
| Senior Demo | admin@senior-demo.com | Admin@Senior2026 | Módulos ILPI |
| Hotel Demo | admin@hotel-demo.com | Admin@Hotel2026 | Módulos hotelaria |
| Restaurant Demo | admin@restaurant-demo.com | Admin@Rest2026 | Módulos restaurante |
| Education Demo | admin@education-demo.com | Admin@Edu2026 | Módulos escola |
| Vet Demo | admin@vet-demo.com | Admin@Vet2026 | Módulos veterinária |
| Services Demo | admin@services-demo.com | Admin@Svc2026 | Módulos prestador |

---

## MÓDULOS DO SISTEMA

### Módulos Compartilhados (todas as verticais têm)

| Módulo | O que faz | Onde fica |
|--------|-----------|-----------|
| **Dashboard** | KPIs em tempo real, alertas | `/dashboard` |
| **Financeiro** | Mensalidades, contas, DRE, Pix | `/financeiro` |
| **Agenda** | Agendamentos, profissionais, salas | `/agenda` |
| **Documentos** | Contratos, receitas, recibos (geração automática) | `/documentos` |
| **Estoque** | Itens, alertas de mínimo, validade | `/estoque` |
| **Comunicação** | WhatsApp via BotConversa, fluxos | `/comunicacao` |
| **Relatórios** | Ocupação, financeiro, clínico, exportação | `/relatorios` |
| **Configurações** | Integrações, usuários, clínica | `/configuracoes` |

### Módulos Específicos por Vertical

| Módulo | Verticais que usam |
|--------|-------------------|
| Prontuário/Evoluções | Recovery, Clinic, Senior, Vet |
| Prescrições | Recovery, Clinic |
| Quartos/Leitos | Recovery, Senior, Hotel |
| Portal da Família | Recovery, Senior, Education |
| CRM | Clinic, Services, Restaurant |
| Anamnese | Clinic |
| Convênios TISS | Clinic |
| PDV/Comandas | Restaurant |
| Reservas | Hotel |

---

## FLUXOS PRINCIPAIS (passo a passo)

### Onboarding de Novo Cliente

```
1. Cliente acessa /onboarding
2. Escolhe a vertical do negócio (8 opções)
3. Preenche nome da organização + nome do admin
4. Cria email e senha
5. Sistema cria: tenant + user + session (auto-login)
6. Cliente cai direto no dashboard com features da vertical ativas
```

**Tempo total: < 30 segundos**

### Cadastro de Paciente/Cliente (Recovery como exemplo)

```
1. Menu: Pacientes → Novo
2. Preencher: nome, CPF, nascimento, sexo, estado civil
3. Dados clínicos: substância, tempo de uso, comorbidades
4. Financeiro: valor mensalidade, dia vencimento
5. Responsável: nome, CPF, parentesco, telefone
6. Salvar → paciente criado
```

### Gerar Contrato

```
1. Ficha do paciente → aba Documentos
2. Clicar "Gerar Documento"
3. Selecionar "Contrato"
4. Sistema preenche automaticamente com dados do paciente
5. Download .docx (pronto para imprimir/assinar)
```

### Registrar Evolução

```
1. Menu: Prontuário → Nova Evolução
2. Selecionar paciente
3. Escolher tipo (Médica, Psicológica, Enfermagem, etc.)
4. Escrever conteúdo
5. Registrar sinais vitais (opcional)
6. Salvar → depois Assinar (irreversível)
```

### Transferir Paciente de Quarto

```
1. Ficha do paciente → aba Resumo
2. Na linha "Quarto", clicar "Mudar"
3. Modal mostra todos os quartos com ocupação
4. Selecionar quarto com vaga
5. Confirmar transferência
```

### Enviar Mensagem WhatsApp

```
1. Menu: Comunicação
2. Selecionar destinatário (telefone ou paciente)
3. Escolher: mensagem avulsa OU fluxo automatizado
4. Enviar
5. Status aparece: ENVIADA → ENTREGUE → LIDA
```

### Portal da Família (para responsáveis)

```
1. Admin gera token em Configurações → Portal da Família
2. Envia token ao responsável
3. Responsável acessa /portal-familia e insere o token
4. Vê: resumo do tratamento, evoluções, agenda, financeiro
5. Pode pagar mensalidade via QR Code Pix
```

---

## PERFIS DE ACESSO (RBAC)

| Perfil | O que vê | O que NÃO vê |
|--------|----------|--------------|
| **ADMIN** | Tudo + Platform + Configurações | — |
| **Coordenador Terapêutico** | Pacientes, prontuário, agenda, estoque, quartos, documentos, comunicação | Financeiro, relatórios, configurações |
| **Médico** | Pacientes, prontuário, prescrições, agenda, documentos | Financeiro, estoque, quartos |
| **Psicólogo** | Pacientes, prontuário, agenda | Financeiro, estoque, documentos |
| **Enfermeiro** | Pacientes, prontuário, agenda, estoque, quartos | Financeiro |
| **Terapeuta** | Pacientes, prontuário, agenda | Financeiro, estoque |
| **Secretária** | Pacientes, agenda, quartos, documentos, comunicação | Prontuário, financeiro |
| **Financeiro** | Financeiro, relatórios, documentos | Prontuário |
| **Monitor** | Agenda, estoque, quartos | Financeiro, prontuário |
| **Apoio** | Agenda, estoque | Financeiro, prontuário, quartos |

---

## SUPER ADMIN (só para nós)

Acesse: `/admin-platform` (apenas ADMIN vê esse menu na sidebar como "Platform")

### O que tem:
- **Dashboard**: Total de tenants, ativos, usuários, verticais
- **Lista de organizações**: cada tenant com vertical, plano, status
- **Detalhe do tenant**: feature flags (ligar/desligar módulos), users, ativar/desativar
- **Health**: status do banco, memória, uptime
- **Criar tenant**: nome, slug, vertical, plano
- **Convidar user**: gera credenciais temporárias

### Criar um novo tenant manualmente (para cliente que não usa onboarding):
1. Acessar `/admin-platform`
2. Clicar "Novo Tenant"
3. Preencher: nome, slug, vertical, plano
4. Depois clicar no tenant criado → "Invite" para criar user admin

---

## INTEGRAÇÕES

### WhatsApp (BotConversa)
- Configuração: Configurações → Integrações → BotConversa
- Inserir API Key → Testar Conexão → Salvar
- Funciona para: mensagens avulsas e fluxos automatizados

### Pix (Sicredi)
- Status: código pronto, aguardando certificado da cooperativa
- Portal da Família já gera QR Code Pix estático (funciona sem API)

### NFS-e
- Dual mode: manual (dados para nfse.gov.br) ou via intermediador (nfe.io)
- Configuração: Configurações → Integrações → NFS-e

### e-SUS / SISNAD
- Página de configuração com passo a passo
- Exportação de dados para upload governamental

---

## PLANOS E PRICING

| Plano | Preço/mês | Users | Pacientes | Para quem |
|-------|-----------|-------|-----------|-----------|
| **Starter** | R$ 299 | 5 | 50 | Pequenos negócios |
| **Professional** | R$ 599 | 15 | 200 | Médios negócios |
| **Enterprise** | R$ 1.499 | Ilimitado | Ilimitado | Grandes operações |

---

## SCRIPT DE APRESENTAÇÃO (para demos)

### Abertura (30s)
> "A Hachi Platform é um Business Operating System — uma única plataforma que serve 8 mercados diferentes. De clínicas médicas a restaurantes, cada vertical recebe um sistema completo com financeiro, agenda, documentos, WhatsApp integrado e portal para clientes."

### Demo (5-10 min)
1. Mostrar o **onboarding** (criar conta em 30s)
2. Mostrar o **dashboard** com KPIs
3. Mostrar o **cadastro** (paciente/cliente/hóspede — depende da vertical)
4. Mostrar a **geração de documento** (contrato em 30s)
5. Mostrar o **portal externo** (família/cliente)
6. Mostrar o **Super Admin** (feature flags, multi-tenant)

### Fechamento
> "O sistema já está em produção com o CT Persev, nosso primeiro cliente. Temos 25 mil linhas de código, 105 páginas funcionais, e a plataforma suporta múltiplos tenants simultâneos com dados isolados."

---

## FAQ (perguntas que vão surgir)

| Pergunta | Resposta |
|----------|---------|
| "Funciona no celular?" | Sim, 100% responsivo. Sidebar vira drawer no mobile. |
| "Os dados são seguros?" | Sim. Criptografia AES-256, LGPD compliance, audit log completo. |
| "Posso customizar?" | Sim. Feature flags permitem ligar/desligar módulos. White-label futuro. |
| "Quantos usuários?" | Depende do plano. Starter=5, Professional=15, Enterprise=ilimitado. |
| "Tem app?" | Não ainda. É web responsivo (funciona como app via navegador). |
| "Integra com o quê?" | WhatsApp (BotConversa), Pix (Sicredi), NFS-e, e-SUS. |
| "Quanto custa?" | A partir de R$299/mês (Starter). Enterprise sob consulta. |
| "Tem contrato de fidelidade?" | Não. Mensal, cancela quando quiser. |
| "Quanto tempo pra implantar?" | Self-service: 30 segundos. Com migração de dados: 1-2 semanas. |

---

## TERMOS TÉCNICOS (glossário)

| Termo | Significado |
|-------|-------------|
| Tenant | Uma organização/cliente dentro da plataforma |
| Vertical | O tipo de negócio (clinic, hotel, restaurant, etc.) |
| Feature flag | Chave liga/desliga para módulos |
| RBAC | Role-Based Access Control (permissões por perfil) |
| Multi-tenant | Vários clientes na mesma infra com dados isolados |
| JWT | Token de autenticação (JSON Web Token) |
| Onboarding | Processo de criar conta e começar a usar |
| LGPD | Lei Geral de Proteção de Dados |
| Audit log | Registro de toda ação no sistema |
| API | Interface de programação (como os módulos conversam) |

---

*Marquinhos, se tiver dúvida que não está aqui, me procure. Este guia será atualizado conforme o produto evolui.*
