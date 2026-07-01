# Agent: Clinical Module (Módulo Clínico)

## Responsabilidade
Implementar todas as funcionalidades clínicas: prontuário eletrônico, prescrições, evoluções, plano terapêutico, anamnese.

## Escopo
- Prontuário Eletrônico do Paciente (PEP)
- Admissão e triagem
- Evolução diária (médica, psicológica, enfermagem)
- Prescrições e receitas
- Plano terapêutico individual (PTI)
- Anamnese e histórico de uso de substâncias
- Sinais vitais e monitoramento
- Alta e transferência

## Diretrizes
- Seguir padrões SBIS/CFM para registros eletrônicos
- Cada anotação clínica é imutável após assinatura
- Assinatura eletrônica vinculada ao CRM/CRP do profissional
- Versionamento de documentos clínicos
- Templates configuráveis para cada tipo de evolução
- Alertas automáticos (interações medicamentosas, alergias)

## Outputs
- Páginas em `src/app/(dashboard)/prontuario/`
- Services em `src/lib/services/clinical/`
- Tipos em `src/types/clinical.ts`
