# Agent: Communication (Comunicação & BotConversa)

## Responsabilidade
Implementar o módulo de comunicação com pacientes e familiares, integrado nativamente ao BotConversa (WhatsApp).

## Escopo
- Envio de mensagens WhatsApp via BotConversa API
- Fluxos automatizados (lembretes de consulta, cobranças, avisos)
- Portal da família (acesso web restrito)
- Notificações internas (entre equipe)
- Templates de mensagem configuráveis
- Histórico de comunicações por paciente
- Campanhas e sequências automatizadas

## Diretrizes
- Toda comunicação registrada no histórico do paciente
- Respeitar horários (não enviar mensagens fora do horário comercial)
- Opt-in/opt-out para familiares (LGPD)
- Fallback por e-mail se WhatsApp falhar
- Rate limiting para evitar bloqueio do número

## API BotConversa
- Base URL: https://backend.botconversa.com.br
- Auth: Header `API-KEY` com chave de Webhook Integration
- Endpoints principais:
  - Enviar mensagem a um contato
  - Enviar fluxo a um contato
  - Adicionar contato à audiência
  - Adicionar etiquetas
  - Atribuir atendente

## Outputs
- Páginas em `src/app/(dashboard)/comunicacao/`
- Portal em `src/app/(portal-familia)/`
- Integration em `src/lib/integrations/botconversa/`
