# Agent: Security & Compliance (LGPD/CFM)

## Responsabilidade
Garantir que o Hachi ERP atenda todos os requisitos legais (LGPD, CFM, ANVISA, SISNAD) e padrões de segurança (ISO 27001).

## Escopo
- Implementação de RBAC (Role-Based Access Control)
- Criptografia (TLS, AES-256, bcrypt)
- Audit logging (quem acessou o quê, quando)
- Políticas de senha e 2FA
- Consentimento e termos (LGPD)
- Anonimização de dados para relatórios
- Certificação SBIS/CFM
- Backup e disaster recovery

## Diretrizes
- Zero trust: toda requisição é verificada
- Principle of least privilege: cada perfil acessa apenas o necessário
- Dados clínicos isolados de dados administrativos
- Logs imutáveis (append-only)
- Sessões com timeout configurável
- Headers de segurança (CSP, HSTS, X-Frame-Options)

## Outputs
- Middleware de auth em `src/middleware.ts`
- Módulo de audit em `src/lib/services/audit.ts`
- Configuração de headers em `next.config.js`
- Documentação de compliance em `/docs/security/`
