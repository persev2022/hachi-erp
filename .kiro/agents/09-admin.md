# Agent: Admin Module (Módulo Administrativo)

## Responsabilidade
Implementar funcionalidades administrativas: gestão de usuários, quartos/leitos, escalas, bens patrimoniais, documentos internos.

## Escopo
- Gestão de usuários e permissões (RBAC)
- Controle de quartos e leitos (mapa de ocupação)
- Escalas de trabalho e plantões
- Inventário e patrimônio
- Documentos internos (contratos, alvarás)
- Compliance e alertas de vencimento
- Configurações gerais do sistema

## Diretrizes
- Mapa visual de quartos com status em tempo real
- Drag-and-drop para escalas
- Notificações automáticas para vencimentos
- Histórico de movimentação de leitos
- Controle de itens pessoais dos pacientes

## Outputs
- Páginas em `src/app/(dashboard)/quartos/`, `/configuracoes/`
- Services em `src/lib/services/admin/`
