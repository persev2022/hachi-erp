# Evolução Hachi — De ERP Vertical para Business Operating System

> Análise estratégica de produto — Julho 2026

---

## Tese Central

O Hachi não é um software para comunidades terapêuticas. Ele foi verticalizado para esse mercado, mas a arquitetura é de um ERP corporativo moderno. Isso muda completamente a estratégia de produto.

Na prática, o que diferencia uma comunidade terapêutica de uma clínica médica, uma casa de repouso ou uma instituição de ensino são alguns módulos específicos. Cerca de 80% do sistema pode ser reutilizado.

---

## 1. Mercados com Adaptação Mínima (80% a 95% de reaproveitamento)

### Saúde
| Vertical | Adaptação necessária |
|----------|---------------------|
| Clínicas médicas | Trocar prontuário e alguns fluxos clínicos. Mercado enorme. |
| Clínicas odontológicas | Prontuário odontológico + odontograma |
| Clínicas de fisioterapia | Evolução por sessão + plano de tratamento |
| Clínicas de psicologia | Prontuário psicológico + laudos |
| Clínicas de psiquiatria | Receitas controladas + CID |
| Hospitais de pequeno porte | Internação + centro cirúrgico |
| Casas de repouso / ILPIs | Acompanhamento do residente + medicação |
| Home Care | Visitas + equipe distribuída + plano de cuidado |
| Centros de diagnóstico | Laudos + resultados |

### Instituições / Educação
- Agenda, Financeiro, Portal dos pais, Documentos, Assinaturas, WhatsApp, Dashboard — tudo já existe
- Bastaria adaptar o prontuário para boletim e histórico escolar

### Hotelaria
- Pousadas, Hotéis, Hostels, Resorts
- Troca-se: Leitos → Quartos, Acolhidos → Hóspedes, Portal da família → Portal do hóspede, Prontuário → Histórico da hospedagem
- Todo o restante permanece

### Gastronomia
- Restaurantes, Pizzarias, Hamburguerias, Dark Kitchens, Cafeterias
- O Hachi já possui: ERP, Financeiro, Estoque, Dashboard, Documentos, NFS-e, RBAC, Auditoria, WhatsApp
- Só seria necessário criar: PDV, Comandas, Produção, Delivery, KDS, Integrações com iFood

### Prestadores de Serviço
- Agências, Advogados, Contadores, Consultorias, Arquitetos, Imobiliárias
- Mudam apenas alguns cadastros

### Recursos Humanos
- Empresas de terceirização, Facilities, Segurança, Limpeza
- Agenda, Escalas, Documentos, Financeiro, Portal do colaborador

### Academias
- CrossFit, Pilates, Personal
- Portal do aluno, Agenda, Financeiro, Documentos

### Mercado Pet
- Hospitais veterinários, Clínicas, Pet shops, Hotel para pets
- Troca apenas o prontuário humano pelo animal

---

## 2. O Verdadeiro Potencial — Hachi Platform

O maior erro seria vender o Hachi apenas como "software para comunidade terapêutica". Na verdade ele deveria ser uma **plataforma**.

```
Hachi Platform
├── Hachi Recovery       → Comunidades Terapêuticas
├── Hachi Clinic         → Clínicas Médicas
├── Hachi Care           → Home Care
├── Hachi Senior         → Casas de Repouso
├── Hachi Education      → Escolas
├── Hachi Restaurant     → Restaurantes
├── Hachi Hotel          → Hotelaria
├── Hachi Business       → Prestadores de Serviço
├── Hachi Vet            → Mercado Veterinário
└── Hachi Enterprise     → ERP Genérico
```

Cada vertical teria a mesma base tecnológica, alterando apenas módulos específicos.

---

## 3. Visão Business OS (Beyond ERP)

O conceito de "ERP" é limitante. A Hachi deveria ser posicionada como **Business Operating System (Business OS)**:

> **HACHI — Business Operating System**
> One Platform. Infinite Business Verticals.

### Lógica Central — 4 pilares:

| Pilar | Função |
|-------|--------|
| **Operar** | Organizar o dia a dia |
| **Controlar** | Dar visibilidade de financeiro, processo, documentos, equipe e status |
| **Integrar** | Conectar WhatsApp, pagamento, fiscal, portal, automação e APIs |
| **Evoluir** | Permitir que a mesma base sirva vários mercados |

---

## 4. Estrutura Macro da Plataforma

```
HACHI PLATFORM
│
├── Core Platform (Engine)
│   ├── Autenticação & Segurança
│   ├── Multi-tenant
│   ├── Perfis e Permissões (RBAC)
│   ├── Auditoria & Compliance
│   ├── API Gateway
│   ├── Integrações
│   └── Notificações
│
├── Shared Business Layer (Business OS)
│   ├── Financeiro (Contas, Fluxo, DRE, Cobrança)
│   ├── ERP / Fiscal (NFS-e, Tributário)
│   ├── CRM (Cadastro, Jornada, Segmentação)
│   ├── Agenda (Scheduling, Leitos, Salas)
│   ├── Documentos (Templates, Assinatura, Versionamento)
│   ├── Automação (Gatilhos, Fluxos, Follow-up)
│   ├── WhatsApp (Envio, Bots, Atendimento)
│   ├── BI / Dashboards (Indicadores, Alertas)
│   └── Portal (Externo para clientes/famílias)
│
├── Vertical Modules (Industry Packs)
│   ├── Recovery (Prontuário, Evolução, Leitos, Alta)
│   ├── Clinic (Prontuário clínico, Exames, Convênios)
│   ├── Senior (Residente, Medicação, Família)
│   ├── Care (Visitas, Plano de cuidado, Equipe)
│   ├── Education (Matrícula, Boletim, Pais)
│   ├── Restaurant (PDV, Comandas, Produção, Delivery)
│   ├── Hotel (Reservas, Check-in/out, Hóspedes)
│   ├── Vet (Prontuário animal, Vacinas)
│   └── Services (Propostas, Contratos, CRM)
│
└── Experience Layer (Portais)
    ├── Admin Portal
    ├── Staff Portal
    ├── Client / Family Portal
    └── Mobile Apps
```

---

## 5. Modelo de Monetização

| Camada | Descrição |
|--------|-----------|
| Licença base | Acesso ao núcleo da plataforma |
| Módulos adicionais | Cada vertical ou funcionalidade vendida à parte |
| Implantação | Setup, configuração, migração e treinamento |
| Suporte e manutenção | Acompanhamento contínuo |
| Customizações | Mudanças específicas por cliente |
| White-label | Versão com marca do parceiro |
| Expansão por unidade | Cliente cresce, contrato cresce junto |

---

## 6. Potencial Estratégico

O maior valor não está só no software atual. Está no que ele pode virar.

Possibilidades abertas:
- Vender em múltiplos mercados
- Reduzir dependência de um único nicho
- Criar recorrência de software (SaaS)
- Construir valuation de produto
- Atrair parceiros e distribuidores
- Criar ecossistema com ativos digitais próprios

---

## 7. Visão de Produto Final

| Conceito | Descrição |
|----------|-----------|
| **Hachi Platform** | Núcleo tecnológico (Core Engine + Business OS) |
| **Hachi Recovery** | Primeira vertical (atual, em produção) |
| **Próximas verticais** | Clinic, Senior, Restaurant, Hotel... |

> O produto não é um software isolado. É uma plataforma com especializações.
> Essa é a estrutura mais escalável.

---

## 8. Próximos Passos Concretos

### Fase 1 — Consolidar Recovery (Atual)
- Finalizar Pix em produção (certificado Sicredi)
- Migrar para OCI (infra própria)
- Validar com CT Persev (feedback loop)

### Fase 2 — Preparar para Multi-vertical
- Implementar Multi-tenant (tenant_id em todas as tabelas)
- Abstrair módulos verticais em plugins/flags
- Criar sistema de feature flags por tenant
- Separar "Core" de "Recovery-specific" no código

### Fase 3 — Segunda Vertical (Clinic ou Senior)
- Escolher vertical com menor gap de adaptação
- Criar Hachi Clinic (prontuário clínico + agenda + convênios)
- Landing page específica para o novo vertical
- Primeiro cliente piloto

### Fase 4 — Plataforma SaaS
- Painel de onboarding self-service
- Billing e planos
- Marketplace de módulos
- API pública para integradores

---

*Documento baseado em análise estratégica de produto — Julho 2026*
