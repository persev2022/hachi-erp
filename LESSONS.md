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

### Banco de Dados
- **Não rodar `prisma generate` após alterar schema** — tipos ficam desatualizados e TypeScript não reclama imediatamente.
- **Migrations sem backup** — sempre `db push` em dev, `migrate deploy` em prod com backup prévio.

### Integrações
- **API BotConversa**: autenticação via header `API-KEY` com a chave de "Webhook Integration" da companhia. Base URL: `https://backend.botconversa.com.br`. Swagger disponível para teste.
- **Pix BACEN**: usar a spec OpenAPI oficial (`github.com/bacen/pix-api`). Endpoints principais: `/cob`, `/cobv`, `/pix`, `/webhook`.
- **DFe.NET (NF-e)**: biblioteca .NET — no contexto Node.js, usar wrapper via API REST ou lib JS equivalente (ex: `nfe.io`).

---

## 🔁 Código Reutilizável

### Padrão de API Route (Next.js App Router)
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.resource.findMany();
  return NextResponse.json(data);
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

### Padrão de Middleware RBAC
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) return token?.role === "ADMIN";
      if (path.startsWith("/clinico")) return ["MEDICO", "PSICOLOGO", "ENFERMEIRO"].includes(token?.role);
      return !!token;
    },
  },
});

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/clinico/:path*"] };
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
