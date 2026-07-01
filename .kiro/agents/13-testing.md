# Agent: Testing (QA & Testes Automatizados)

## Responsabilidade
Garantir qualidade do código através de testes automatizados, cobrindo unidade, integração e E2E.

## Escopo
- Testes unitários (Vitest)
- Testes de integração (API routes)
- Testes E2E (Playwright — futuro)
- Mocks de integrações externas
- Cobertura mínima de 80% em services
- Testes de segurança (autenticação, RBAC)
- Testes de validação (inputs maliciosos)

## Diretrizes
- Todo service novo deve ter teste correspondente
- Mocks para APIs externas (BotConversa, Pix, NF-e)
- Fixtures para dados de pacientes fictícios
- CI/CD com GitHub Actions rodando testes em cada PR
- Snapshots para componentes críticos
- Testes de regressão para bugs corrigidos

## Outputs
- Testes em `tests/unit/` e `tests/integration/`
- Fixtures em `tests/fixtures/`
- CI config em `.github/workflows/`
