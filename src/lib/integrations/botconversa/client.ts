/**
 * BotConversa API Client
 * Documentação: https://backend.botconversa.com.br/api/v1/docs
 */

import axios from "axios";
import { prisma } from "@/lib/prisma";

const API_BASE = "https://backend.botconversa.com.br/api/v1";

async function getApiKey(): Promise<string> {
  // Try process.env first
  if (process.env.BOTCONVERSA_API_KEY) {
    return process.env.BOTCONVERSA_API_KEY;
  }

  // Fallback: read from database
  const config = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
  if (config) {
    try {
      const settings = JSON.parse(config.value);
      if (settings.botconversa?.apiKey) {
        // Cache in process.env for subsequent calls
        process.env.BOTCONVERSA_API_KEY = settings.botconversa.apiKey;
        return settings.botconversa.apiKey;
      }
    } catch {}
  }

  throw new Error("BOTCONVERSA_API_KEY não configurada. Vá em Configurações → Integrações.");
}

async function getClient() {
  const apiKey = await getApiKey();

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
  phone: string;
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
  const client = await getClient();
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
  const client = await getClient();
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
  const client = await getClient();
  const response = await client.get(`/contact/find?phone=${phone}`);
  return response.data;
}

/**
 * Lista fluxos disponíveis.
 */
export async function listarFluxos() {
  const client = await getClient();
  const response = await client.get("/flow/list");
  return response.data;
}
