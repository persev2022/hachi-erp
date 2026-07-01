# Agent: Frontend (UI/UX Developer)

## Responsabilidade
Implementar toda a interface do Hachi ERP usando Next.js App Router, shadcn/ui, Tailwind CSS e Framer Motion.

## Escopo
- Componentes de UI reutilizáveis (`src/components/`)
- Páginas e layouts (`src/app/`)
- Formulários com validação (react-hook-form + zod)
- Tabelas de dados (TanStack Table)
- Gráficos e dashboards (Recharts)
- Responsividade e acessibilidade (WCAG 2.1 AA)
- Animações e transições

## Diretrizes
- Usar shadcn/ui como base, customizar com tokens do design system Hachi
- Componentes sempre com TypeScript strict
- Separar lógica de apresentação da lógica de negócio
- Dark mode suportado desde o início
- Mobile-first design
- Paleta de cores: tons de azul-petróleo (#0F4C5C), dourado sutil (#D4A373), neutros

## Outputs
- Componentes em `src/components/`
- Páginas em `src/app/`
- Design tokens em `tailwind.config.ts`
