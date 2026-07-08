# 📘 Hachi ERP — Lessons Learned

> Registro contínuo de acertos e erros para evitar retrabalho e reaproveitar soluções.

---

## ✅ Acertos

### Arquitetura
- **Monorepo com Next.js App Router**: permite SSR, API routes e React Server Components no mesmo projeto, reduzindo complexidade de deploy.
- **Prisma como ORM**: gera tipos TypeScript automaticamente do schema, evita SQL injection por padrão, migrations versionadas.
- **shadcn/ui como design system**: componentes copiados ao projeto (não dependência), customização total sem breaking changes de lib.
- **Zustand para estado global**: minimalista, sem boilerplate, performance superior ao Context API para estados frequentes.
- **React Query para server state**: cache automático, invalidação, retry, prefetch — separa bem estado do servidor vs cliente.
- **Zod para validação**: schema-first, integra com react-hook-form e com Prisma, validação no client e server.

### Padrões de Código
- Separar lógica de negócio em `lib/services/` e manter components "burros" (apenas UI).
- Usar barrel exports (`index.ts`) em cada módulo para imports limpos.
- Nomear arquivos com kebab-case, componentes com PascalCase.
- Sempre tipar retornos de funções — evita bugs silenciosos.

### Segurança (LGPD/CFM)
- Criptografia bcrypt para senhas, AES-256 para dados sensíveis em repouso.
- RBAC granular via middleware Next.js + tabela de permissões no banco.
- Audit log em toda operação de escrita no prontuário (quem, quando, o quê).
- Dados clínicos nunca expostos em endpoints que perfis administrativos acessam.
- **Rate limiting**: 5 tentativas/min no login por IP, 120 req/min global por IP.
- **CORS**: allowlist de origens (localhost + domínio Vercel), rejeita origens desconhecidas.
- **Token blacklist**: JWT revogado no logout via blacklist in-memory (Redis em produção).
- **Cookie**: httpOnly + secure + sameSite=strict — nunca exposto em URL.
- **Sem enumeração**: login retorna "Credenciais inválidas" tanto para email inexistente quanto para senha errada.
- **PII mínimo**: todas as queries com `select` explícito, password hash nunca sai do server.
- **CSP**: Content-Security-Policy com `frame-ancestors 'none'`, bloqueio de inline scripts em prod.
- **SQL Injection impossível**: Prisma ORM — zero raw queries no projeto.

### Documentos & Integrações
- **docxtemplater** funciona no server-side Next.js — importar `fs` e `path` normalmente em API routes.
- Para retornar binário (docx) no NextResponse, usar `new Uint8Array(buffer)` em vez de Buffer direto (TypeScript strict não aceita Buffer como BodyInit).
- Templates .docx ficam em `src/lib/documents/templates/` — caminho relativo ao `process.cwd()`.
- **numero-por-extenso** não tem tipos — criar `src/types/modules.d.ts` com declare module.
- Webhook do BotConversa DEVE ser público (sem auth) — adicionar à lista de PUBLIC_PATHS no middleware.

### Mobile/Responsividade
- Sidebar responsiva: desktop usa `fixed w-64`, mobile usa drawer com `translate-x` + overlay.
- Layout do dashboard usa `lg:pl-64` (não `pl-64` fixo) para não empurrar conteúdo no mobile.
- Header mobile separado com hamburger — aparece apenas `lg:hidden`.
- Todas as tabelas precisam de `overflow-x-auto` no container para mobile.

---

## ❌ Erros a Evitar

### Geral
- **Não instalar dependências antes de rodar testes** — sempre verificar se `node_modules` está completo.
- **Esquecer o `SKIP_PDF=1`** em ambiente de teste — scripts que dependem de LibreOffice falham no CI sem essa flag.
- **Repositório privado + gh CLI sem autenticação** — sempre verificar `gh auth status` antes de operações remotas.

### Next.js / React
- **Não misturar `use client` e `use server`** no mesmo arquivo — Next.js não permite.
- **Esquecer o `"use client"` em componentes com hooks** — erro silencioso que crasheia apenas em produção.
- **Importar componentes shadcn errado** — sempre de `@/components/ui/...`, nunca do node_modules.
- **Params em App Router 15+**: `params` é uma Promise agora — usar `const { id } = await params;` em API routes dinâmicas.
- **output: "export" incompatível com API routes** — remover para SSR quando usar API routes no Next.js.

### Banco de Dados
- **Não rodar `prisma generate` após alterar schema** — tipos ficam desatualizados e TypeScript não reclama imediatamente.
- **Migrations sem backup** — sempre `db push` em dev, `migrate deploy` em prod com backup prévio.

### Integrações
- **API BotConversa**: autenticação via header `API-KEY` com a chave de "Webhook Integration" da companhia. Base URL: `https://backend.botconversa.com.br`. Swagger disponível para teste.
- **Pix BACEN**: usar a spec OpenAPI oficial (`github.com/bacen/pix-api`). Endpoints principais: `/cob`, `/cobv`, `/pix`, `/webhook`.
- **DFe.NET (NF-e)**: biblioteca .NET — no contexto Node.js, usar wrapper via API REST ou lib JS equivalente (ex: `nfe.io`).

---

## 🔁 Código Reutilizável

### Padrão de API Route (Next.js App Router — Custom JWT)
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  const data = await prisma.resource.findMany();
  return NextResponse.json({ success: true, data });
}
```

### Padrão de Componente com Form (shadcn + react-hook-form + zod)
```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({ name: z.string().min(1, "Obrigatório") });
type FormValues = z.infer<typeof schema>;

export function ExampleForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = (data: FormValues) => { /* ... */ };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <Input {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  );
}
```

### Padrão de Middleware RBAC (Custom JWT)
```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/integracoes/botconversa/webhook", "/_next", "/images"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) return NextResponse.next();

  const token = req.cookies.get("session-token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const session = await verifyToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session-token");
    return response;
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"] };
```

---

## 📅 Histórico

| Data | Tipo | Descrição |
|------|------|-----------|
| 2026-07-01 | ✅ | Projeto inicializado com arquitetura definida |
| 2026-07-01 | ✅ | Design system escolhido: shadcn/ui + Tailwind |
| 2026-07-01 | ✅ | Integrações mapeadas: BotConversa, Pix BACEN, DFe.NET |
| 2026-07-01 | ✅ | Build Next.js 16.2.10 (Turbopack) passando — 0 erros TypeScript |
| 2026-07-01 | ❌ | tailwind-merge v2.7.0 não existe — corrigido para ^3.6.0 |
| 2026-07-01 | ❌ | Next.js 15.1.0 tem CVE — atualizado para 16.2.10 |
| 2026-07-01 | ✅ | Prisma generate funciona sem banco conectado (apenas para tipos) |
| 2026-07-01 | ✅ | 15 sub-agentes criados + task board com 80+ tasks delegadas |
| 2026-07-02 | ✅ | Sprint 1 completo: Auth JWT + Prisma + Pacientes CRUD + Middleware |
| 2026-07-02 | ✅ | Sprint 2 completo: Prontuário, Agenda, Perfil paciente, Mobile sidebar |
| 2026-07-02 | ✅ | Sprint 3 completo: Financeiro, Estoque, Quartos, Documentos (portados do scripts-adm) |
| 2026-07-02 | ✅ | Sprint 4 completo: BotConversa (envio + webhook), Comunicação |
| 2026-07-02 | ✅ | 22 API routes implementadas, 16 páginas funcionais |
| 2026-07-02 | ✅ | Build passando com 0 erros — Next.js 15.5.20 |

---

## 🏗️ Estado Atual do Projeto (atualizado 02/07/2026)

### APIs Implementadas (22 routes):
- **Auth**: login, logout, me
- **Pacientes**: CRUD completo com soft delete, Zod validation, audit log
- **Prontuário**: evoluções (CRUD + assinatura), prescrições (CRUD + toggle)
- **Agenda**: CRUD com conflito de horário, transições de status
- **Financeiro**: movimentações CRUD + conta corrente por paciente
- **Estoque**: CRUD + movimentação entrada/saída + alertas
- **Quartos**: listagem + atualização de status
- **Documentos**: geração via docxtemplater (5 tipos)
- **Comunicação**: BotConversa envio + fluxos + webhook
- **Users**: listagem por role (para selectors)

### Páginas Funcionais (16):
- Login, Dashboard, Pacientes (lista + perfil + editar + novo)
- Prontuário, Agenda, Financeiro, Estoque, Quartos
- Documentos, Comunicação, Relatórios, Configurações

### O que falta para 100%:
1. **RBAC granular na sidebar** (esconder itens por role)
2. **Integrações Pix + NF-e**
3. **Relatórios reais** (dashboard com KPIs do banco)
4. **Testes automatizados**
5. **2FA, criptografia de campos sensíveis**
6. **Dark mode, busca global (Cmd+K)**
7. **Portal da família**

---

## 🚀 Evolução Estratégica (Jul/2026)

### Insight Principal
- **O Hachi não é um software para CTs — é um ERP corporativo moderno verticalizado para esse mercado.**
- ~80% do sistema é reutilizável para qualquer vertical (saúde, educação, hotelaria, gastronomia, serviços).
- O posicionamento correto é **Business Operating System (Business OS)**, não "ERP para CT".

### Decisões Estratégicas
- **Multi-vertical**: a mesma base tecnológica pode servir 9+ mercados com adaptação mínima de módulos específicos.
- **Multi-tenant primeiro**: antes de escalar verticais, implementar tenant_id e isolamento de dados.
- **Feature flags**: módulos verticais devem ser ativáveis/desativáveis por tenant.
- **Recovery é a primeira vertical validada** — usar como proof of concept para as próximas.

### Hierarquia de Produto
```
Hachi Platform (Core Engine + Business OS)
└── Hachi Recovery (primeira vertical, produção)
└── Hachi Clinic (segunda vertical, planejada)
└── Hachi Senior, Hotel, Restaurant... (futuras)
```

### O que NÃO fazer
- Não vender como "software para CT" — isso limita o TAM (Total Addressable Market).
- Não construir verticais do zero — sempre herdar do Core + Business Layer.
- Não criar repos separados por vertical — monorepo com feature flags é mais eficiente.
- Não ignorar o potencial SaaS — self-service onboarding é o caminho para escala.

### Referências de Posicionamento
- Salesforce: plataforma + verticais (Health Cloud, Financial Cloud, etc.)
- SAP: Business Suite + Industry Solutions
- ServiceNow: Platform + vertical workflows
- A Hachi segue o mesmo padrão, em escala menor mas com a mesma filosofia.


---

## 🐛 Bug Fixes Importantes (Jul/2026)

### JWT com null values
- **Problema**: `jose` (SignJWT) não aceita `null` como valor no payload. Se `tenantId` é `null`, o login retorna Internal Server Error.
- **Solução**: Filtrar valores nulos antes de assinar o token. Só incluir `tenantId` quando não é null/undefined.
- **Lição**: Sempre sanitizar payloads antes de passar para libs de serialização (JWT, JSON-LD, etc.)

### Multi-tenant activation
- **Problema**: Ativar `MULTI_TENANT_ACTIVE = true` sem que todos os dados tenham `tenantId` pode quebrar queries.
- **Solução**: Rodar `prisma/assign-tenant.ts` ANTES de ativar a flag. Garantir que todo registro tem tenantId.
- **Lição**: Migrations de dados devem preceder mudanças de comportamento.

---

## 📊 Métricas do Projeto (Jul/2026 — última medição)

| Métrica | Valor |
|---------|-------|
| Linhas de código | 28.639 |
| Páginas | 127 |
| API Routes | 95 |
| Modelos Prisma | 17 |
| Testes | 144 (passando) |
| Verticais | 8 (7 com APIs) |
| Tenants demo | 9 |
| Build time | ~5s |
| Deploy time | <60s |

---

## 🏗️ Padrões Arquiteturais Consolidados

### Vertical-specific APIs
- Padrão: `src/app/api/[vertical]/[feature]/route.ts`
- Todas verificam `tenant.vertical === "[vertical]"` (403 se não match)
- Dados armazenados via: Documento model (titulo prefixado) OU SystemConfig (JSON)
- Quando usar Documento: dados vinculados a um paciente/entidade
- Quando usar SystemConfig: dados globais do tenant (tarifas, grade, atividades)

### Feature Flags
- Definidos em `src/lib/features.ts` como `VERTICAL_FEATURES`
- Consultados via `GET /api/platform` (retorna features do tenant logado)
- Aplicados em: sidebar (oculta menu), dashboard (oculta cards), middleware (futuro)

### Terminologia
- Definida em `src/app/api/platform/terminology/route.ts`
- Cada vertical tem mapeamento: paciente→Hóspede, quarto→UH, evolucao→Atendimento
- Frontend fetch e aplica nos títulos/labels

### Branding (White-label)
- Config armazenada no `tenant.config.branding` (JSON)
- API: `GET /api/platform/branding`
- Sidebar aplica `brandColor` como inline style no item ativo
