/**
 * BotConversa API Client
 * Documentação: https://backend.botconversa.com.br/api/v1/docs
 */

import axios from "axios";

const API_BASE = "https://backend.botconversa.com.br/api/v1";

function getClient() {
  const apiKey = process.env.BOTCONVERSA_API_KEY;
  if (!apiKey) {
    throw new Error("BOTCONVERSA_API_KEY não configurada");
  }

  return axios.create({
    baseURL: API_BASE,
    headers: {
      "API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
}

export interface SendMessagePayload {
  phone: string; // Formato: 5548999990001 (DDI + DDD + Número)
  message: string;
}

export interface SendFlowPayload {
  phone: string;
  flowId: string;
  variables?: Record<string, string>;
}

/**
 * Envia uma mensagem de texto avulsa via WhatsApp.
 */
export async function enviarMensagem(payload: SendMessagePayload) {
  const client = getClient();
  const response = await client.post("/message/send-text", {
    phone: payload.phone,
    text: payload.message,
  });
  return response.data;
}

/**
 * Dispara um fluxo automatizado para um contato.
 */
export async function dispararFluxo(payload: SendFlowPayload) {
  const client = getClient();
  const response = await client.post("/flow/start", {
    phone: payload.phone,
    flow_id: payload.flowId,
    variables: payload.variables || {},
  });
  return response.data;
}

/**
 * Busca informações de um contato pelo telefone.
 */
export async function buscarContato(phone: string) {
  const client = getClient();
  const response = await client.get(`/contact/find?phone=${phone}`);
  return response.data;
}

/**
 * Lista fluxos disponíveis.
 */
export async function listarFluxos() {
  const client = getClient();
  const response = await client.get("/flow/list");
  return response.data;
}
