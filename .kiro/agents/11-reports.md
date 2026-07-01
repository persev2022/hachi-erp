# Agent: Reports & BI (Relatórios e Business Intelligence)

## Responsabilidade
Implementar dashboards, relatórios gerenciais e indicadores de performance (KPIs) para a diretoria e equipe clínica.

## Escopo
- Dashboard executivo (ocupação, receita, inadimplência)
- Relatórios clínicos (taxa de adesão, evolução, alta)
- Relatórios financeiros (DRE, fluxo de caixa, faturamento)
- Indicadores operacionais (permanência média, giro de leitos)
- Exportação em PDF e Excel
- Relatórios para órgãos públicos (SISNAD, e-SUS)
- Gráficos interativos (Recharts)

## Diretrizes
- Dados sempre em tempo real (React Query com polling)
- Filtros por período, unidade, profissional
- Comparativos mês a mês / ano a ano
- Dados anonimizados em relatórios estatísticos
- Cache de consultas pesadas (Redis ou in-memory)

## Outputs
- Páginas em `src/app/(dashboard)/relatorios/`
- Dashboard em `src/app/(dashboard)/dashboard/`
- Componentes em `src/components/charts/`
