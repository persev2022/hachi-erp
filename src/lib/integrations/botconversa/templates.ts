/**
 * Message templates for BotConversa.
 * Variables use {{variavel}} syntax, replaced at send time.
 */

export interface MessageTemplate {
  id: string;
  nome: string;
  categoria: "lembrete" | "cobranca" | "boas-vindas" | "alta" | "geral";
  conteudo: string;
  variaveis: string[]; // available variables
}

export const defaultTemplates: MessageTemplate[] = [
  {
    id: "lembrete-consulta",
    nome: "Lembrete de Consulta",
    categoria: "lembrete",
    conteudo: "Olá {{nome_paciente}}! Lembrete: você tem {{tipo_consulta}} agendado para {{data}} às {{hora}} com {{profissional}}. Nos vemos em breve! 🙏",
    variaveis: ["nome_paciente", "tipo_consulta", "data", "hora", "profissional"],
  },
  {
    id: "cobranca-mensalidade",
    nome: "Cobrança de Mensalidade",
    categoria: "cobranca",
    conteudo: "Olá! A mensalidade de {{nome_paciente}} referente a {{mes_referencia}} no valor de R$ {{valor}} vence em {{data_vencimento}}. Pix: {{chave_pix}}. Dúvidas? Fale conosco.",
    variaveis: ["nome_paciente", "mes_referencia", "valor", "data_vencimento", "chave_pix"],
  },
  {
    id: "boas-vindas",
    nome: "Boas-Vindas",
    categoria: "boas-vindas",
    conteudo: "Bem-vindo(a) à família Hachi! {{nome_familiar}}, seu familiar {{nome_paciente}} foi admitido conosco. Estaremos disponíveis pelo WhatsApp para informações. 💚",
    variaveis: ["nome_familiar", "nome_paciente"],
  },
  {
    id: "alta-programada",
    nome: "Aviso de Alta",
    categoria: "alta",
    conteudo: "Informamos que a alta de {{nome_paciente}} está prevista para {{data_alta}}. Entre em contato para agendar a visita de orientação familiar.",
    variaveis: ["nome_paciente", "data_alta"],
  },
  {
    id: "aviso-geral",
    nome: "Aviso Geral",
    categoria: "geral",
    conteudo: "{{mensagem}}",
    variaveis: ["mensagem"],
  },
];

/**
 * Replaces template variables with actual values.
 */
export function renderTemplate(template: MessageTemplate, data: Record<string, string>): string {
  let result = template.conteudo;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

/**
 * Get all available templates.
 */
export function getTemplates(): MessageTemplate[] {
  return defaultTemplates;
}

/**
 * Get a template by ID.
 */
export function getTemplateById(id: string): MessageTemplate | undefined {
  return defaultTemplates.find((t) => t.id === id);
}
