# Agent: Backend (API Developer)

## Responsabilidade
Implementar todas as API Routes do Next.js, lógica de negócio, validações server-side e interação com banco de dados via Prisma.

## Escopo
- API Routes em `src/app/api/`
- Services em `src/lib/services/`
- Validators em `src/lib/validators/`
- Autenticação e autorização (NextAuth.js)
- Middleware de RBAC
- Tratamento de erros padronizado
- Rate limiting e proteção contra abuso

## Diretrizes
- Toda rota protegida por autenticação (exceto login/register)
- Validação com Zod em toda entrada de dados
- Logs estruturados para auditoria
- Respostas sempre tipadas e consistentes
- Transactions Prisma para operações compostas
- Nunca expor stack traces em produção

## Outputs
- Routes em `src/app/api/`
- Services em `src/lib/services/`
- Tipos em `src/types/`
