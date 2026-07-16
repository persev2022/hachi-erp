# BUGS CRÍTICOS — Hachi Platform

Data: 16 de Julho 2026
Reportado por: Victor (administrador CT Persev)

---

## BUG-001 — CRÍTICO: Usuários sem tenantId veem TODOS os pacientes

**Problema:** Quando um usuário é criado via /configuracoes/usuarios sem que o sistema atribua automaticamente o tenantId do admin logado, o JWT desse novo usuário não contém tenantId. A API de pacientes (e outras) não filtra por tenant quando tenantId é null/undefined, mostrando dados de TODOS os tenants.

**Impacto:** Vazamento cross-tenant. Vladimir via 71 pacientes (todos do banco) ao invés dos 42 da CT Persev.

**Causa raiz:** 
1. A API POST /api/configuracoes/usuarios pode criar user sem tenantId
2. A query `if (session.tenantId) { where.tenantId = session.tenantId }` NÃO filtra quando tenantId é undefined

**Correção:**
- Forçar tenantId na criação de usuários (herdar do admin que está criando)
- Na query de pacientes: se tenantId for null, retornar VAZIO (não todos)
- Aplicar mesma lógica em TODAS as APIs

---

## BUG-002 — ALTO: Documentos gerados não são salvos na ficha do paciente

**Problema:** Ao gerar documento (contrato, termo, etc), o DOCX é gerado e retornado como download, mas NÃO é salvo no banco de dados. Portanto não aparece na aba de documentos do paciente.

**Impacto:** Documentos gerados se perdem se o usuário não baixar imediatamente.

**Causa raiz:** A rota `/api/documentos/gerar` não faz `prisma.documento.create()` após gerar o arquivo.

**Correção:** Após gerar o DOCX, salvar registro no modelo Documento com o arquivo em base64 ou referência.

---

## BUG-003 — MÉDIO: Terminologia mostra "Pacientes" antes de carregar "Acolhidos"

**Problema:** Por um breve momento (flash), a sidebar e cards mostram "Pacientes" (default) antes da API de terminology responder. Para o usuário novo (Vladimir) que não tem cache, é mais perceptível.

**Causa raiz:** `useTerminology` inicia com DEFAULT_TERMINOLOGY que tem "Paciente" até o fetch completar.

**Correção:** Usar SSR/cookie para persistir terminology OU mostrar skeleton enquanto carrega.

---

## BUG-004 — MÉDIO: CRM aparece para CT Persev (recovery não deveria ter CRM)

**Problema:** O CRM está habilitado nas features da CT Persev (`crm: true`), mas recovery não deveria ter CRM pipeline por padrão — isso é feature de clinic/hotel/services.

**Causa raiz:** Features da CT Persev foram configuradas manualmente no banco com `crm: true`.

**Correção:** Atualizar config do tenant CT Persev no banco removendo crm, ou manter se for decisão do cliente.

---

## BUG-005 — MÉDIO: Novo usuário criado pode não ter tenantId

**Problema:** A rota de criação de usuários em `/api/configuracoes/usuarios` pode não atribuir tenantId se não for enviado explicitamente no body.

**Causa raiz:** Verificar se o POST herda session.tenantId automaticamente.

**Correção:** Sempre forçar `tenantId: session.tenantId` na criação.

---

## BUG-006 — BAIXO: Sidebar mostra menus de outras verticais

**Problema:** Menus como "Ferramentas" mostram opções de todas as verticais (medicação, vacinas, boletim, tarifas, etc) independente da vertical do tenant.

**Causa raiz:** A página /vertical lista TODAS as ferramentas sem filtrar pela vertical do tenant.

**Correção:** Na página /vertical (ferramentas), filtrar apenas as ferramentas relevantes para a vertical do tenant logado.

---

## PRIORIDADE DE CORREÇÃO

| # | Bug | Prioridade | Esforço |
|---|-----|:---:|:---:|
| 001 | Tenant leak (sem tenantId) | P0 | 15min |
| 002 | Docs não salvam | P1 | 20min |
| 005 | Criar user sem tenant | P1 | 10min |
| 003 | Terminology flash | P2 | 10min |
| 004 | CRM em recovery | P3 | 5min |
| 006 | Ferramentas cross-vertical | P2 | 15min |
