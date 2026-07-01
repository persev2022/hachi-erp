# Agent: Documents (Geração de Documentos)

## Responsabilidade
Implementar geração automatizada de documentos clínicos e administrativos (contratos, receitas, atestados, recibos, relatórios).

## Escopo
- Geração de contratos de internação (docxtemplater)
- Receitas médicas (simples e especial)
- Atestados e declarações
- Recibos de pagamento
- Relatórios médicos e psicológicos
- Plano Terapêutico Individual (PTI)
- Termos de consentimento
- Conversão para PDF

## Diretrizes
- Reutilizar lógica já desenvolvida no `scripts-adm` (templates .docx + docxtemplater)
- Templates editáveis pela equipe administrativa
- Versionamento de templates
- Assinatura eletrônica em documentos clínicos
- Armazenamento vinculado ao prontuário do paciente
- Geração em lote (bulk)

## Integração com scripts-adm
- Importar helpers: `shared/format.js`, `shared/data.js`, `shared/valor.js`
- Adaptar para TypeScript e API route pattern
- Manter compatibilidade com templates .docx existentes

## Outputs
- Services em `src/lib/services/documents/`
- API Routes em `src/app/api/documentos/`
- Templates em `public/templates/`
