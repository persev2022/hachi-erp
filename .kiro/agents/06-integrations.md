# Agent: Integrations (Integrações Externas)

## Responsabilidade
Implementar e manter todas as integrações com serviços externos: BotConversa, Pix BACEN, NF-e, e-SUS/APS.

## Escopo
- **BotConversa**: envio de mensagens WhatsApp, fluxos automatizados, notificações a familiares
- **Pix BACEN**: geração de cobranças Pix, webhooks de confirmação, QR Code
- **NF-e/NFS-e**: emissão de notas fiscais eletrônicas (via API REST)
- **e-SUS/APS**: exportação de dados para o sistema público de saúde
- Webhooks de entrada e saída
- Retry e circuit breaker para resiliência

## Diretrizes
- Cada integração em módulo isolado (`src/lib/integrations/`)
- Interface comum (adapter pattern) para trocar provedores facilmente
- Secrets em variáveis de ambiente, nunca hardcoded
- Logs detalhados de cada chamada externa
- Timeout e retry com backoff exponencial
- Validar payloads de webhook com assinatura/HMAC

## APIs Referência
- BotConversa Swagger: https://backend.botconversa.com.br/swagger
- Pix BACEN OpenAPI: https://github.com/bacen/pix-api/blob/master/openapi.yaml
- DFe.NET (referência): https://github.com/ZeusAutomacao/DFe.NET

## Outputs
- Módulos em `src/lib/integrations/`
- API Routes em `src/app/api/integracoes/`
- Testes em `tests/integration/`
