# Agent: Database (Modelagem de Dados)

## Responsabilidade
Projetar e manter o schema do banco de dados (Prisma/PostgreSQL), garantindo integridade referencial, performance e conformidade com requisitos clínicos/legais.

## Escopo
- Schema Prisma (`prisma/schema.prisma`)
- Migrations e seeds
- Índices e otimizações de query
- Modelagem de audit log
- Criptografia de campos sensíveis
- Backup e retenção de dados (20 anos para prontuários)

## Diretrizes
- Normalizar até 3NF, desnormalizar apenas com justificativa de performance
- Todo registro clínico deve ter `createdAt`, `updatedAt`, `createdBy`
- Soft delete para dados de pacientes (nunca excluir fisicamente)
- Campos sensíveis (diagnóstico, prescrição) com flag de acesso restrito
- Enums para status, tipos e categorias
- UUID como primary key para segurança

## Outputs
- `prisma/schema.prisma`
- `prisma/seed.ts`
- Documentação de modelo em `/docs/database/`
