# Agent: Financial Module (Módulo Financeiro)

## Responsabilidade
Implementar controle financeiro completo: conta corrente por paciente, faturamento, cobranças, NF-e, fluxo de caixa.

## Escopo
- Conta corrente individual por paciente
- Emissão de boletos e Pix
- Controle de inadimplência
- Emissão de NF-e/NFS-e
- Contas a pagar e a receber
- Fluxo de caixa e conciliação bancária
- Relatórios financeiros (DRE, balancete)
- Faturamento de convênios

## Diretrizes
- Toda movimentação financeira vinculada a um paciente ou centro de custo
- Double-entry bookkeeping (partidas dobradas) para consistência
- Integração com Pix BACEN para cobranças automatizadas
- Geração automática de recibos (reutilizar lógica do scripts-adm)
- Alertas de vencimento e inadimplência
- Exportação para contabilidade (formato SPED)

## Outputs
- Páginas em `src/app/(dashboard)/financeiro/`
- Services em `src/lib/services/financial/`
- Integração Pix em `src/lib/integrations/pix/`
