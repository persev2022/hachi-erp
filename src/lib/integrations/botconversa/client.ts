import axios, { AxiosInstance } from "axios";

/**
 * Cliente para a API do BotConversa (WhatsApp).
 *
 * Referência: https://backend.botconversa.com.br/swagger
 * Auth: Header "API-KEY" com chave de Webhook Integration
 */

const BOTCONVERSA_BASE_URL = "https://backend.botconversa.com.br";

function createBotConversaClient(): AxiosInstance {
  const apiKey = process.env.BOTCONVERSA_API_KEY;
  if (!apiKey) {
    throw new Error("BOTCONVERSA_API_KEY não configurada nas variáveis de ambiente");
  }

  return axios.create({
    baseURL: BOTCONVERSA_BASE_URL,
    headers: {
      "API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
}

export interface BotConversaContact {
  phone: string;
  name?: string;
  email?: string;
  tags?: string[];
  custom_fields?: Record<string, string>;
}

export interface BotConversaMessage {
  phone: string;
  message: string;
}

export interface BotConversaFlow {
  phone: string;
  flow_id: string;
}

export const botconversa = {
  /**
   * Envia uma mensagem de texto para um contato.
   */
  async sendMessage(data: BotConversaMessage) {
    const client = createBotConversaClient();
    return client.post("/api/v1/message/send", data);
  },

  /**
   * Envia um fluxo automatizado para um contato.
   */
  async sendFlow(data: BotConversaFlow) {
    const client = createBotConversaClient();
    return client.post("/api/v1/flow/send", data);
  },

  /**
   * Adiciona um contato à audiência.
   */
  async addContact(data: BotConversaContact) {
    const client = createBotConversaClient();
    return client.post("/api/v1/contact/add", data);
  },

  /**
   * Adiciona etiquetas a um contato.
   */
  async addTags(phone: string, tags: string[]) {
    const client = createBotConversaClient();
    return client.post("/api/v1/contact/tags/add", { phone, tags });
  },

  /**
   * Atribui um contato a um atendente.
   */
  async assignAgent(phone: string, agentId: string) {
    const client = createBotConversaClient();
    return client.post("/api/v1/contact/assign", { phone, agent_id: agentId });
  },

  /**
   * Define campos personalizados de um contato.
   */
  async setCustomFields(phone: string, fields: Record<string, string>) {
    const client = createBotConversaClient();
    return client.post("/api/v1/contact/custom-fields/set", { phone, custom_fields: fields });
  },
};
