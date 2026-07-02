/**
 * BotConversa API Client
 * Documentação: https://backend.botconversa.com.br/swagger
 * Base URL: https://backend.botconversa.com.br/api/v1/webhook
 * Auth: Header "API-KEY"
 * Rate limit: 600 RPM
 */

import axios, { AxiosInstance } from "axios";
import { prisma } from "@/lib/prisma";

const API_BASE = "https://backend.botconversa.com.br/api/v1/webhook";

async function getApiKey(): Promise<string> {
  if (process.env.BOTCONVERSA_API_KEY) {
    return process.env.BOTCONVERSA_API_KEY;
  }

  const config = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
  if (config) {
    try {
      const settings = JSON.parse(config.value);
      if (settings.botconversa?.apiKey) {
        process.env.BOTCONVERSA_API_KEY = settings.botconversa.apiKey;
        return settings.botconversa.apiKey;
      }
    } catch {}
  }

  throw new Error("BOTCONVERSA_API_KEY não configurada. Vá em Configurações → Integrações.");
}

async function getClient(): Promise<AxiosInstance> {
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
 * Busca subscriber por telefone.
 * GET /subscriber/get_by_phone/{phone}/
 */
export async function buscarSubscriberPorTelefone(phone: string): Promise<any> {
  const client = await getClient();
  const cleanPhone = phone.replace(/\D/g, "");
  const response = await client.get(`/subscriber/get_by_phone/${cleanPhone}/`);
  return response.data;
}

/**
 * Cria um subscriber (se não existe).
 * POST /subscriber/
 */
export async function criarSubscriber(phone: string, nome?: string): Promise<any> {
  const client = await getClient();
  const response = await client.post("/subscriber/", {
    phone: phone.replace(/\D/g, ""),
    first_name: nome || "",
  });
  return response.data;
}

/**
 * Envia uma mensagem de texto para um subscriber.
 * Fluxo: busca subscriber por telefone → envia mensagem
 * POST /subscriber/{subscriber_id}/send_message/
 */
export async function enviarMensagem(payload: SendMessagePayload) {
  const client = await getClient();
  const cleanPhone = payload.phone.replace(/\D/g, "");

  // Step 1: Find or create subscriber
  let subscriberId: string;
  try {
    const subscriber = await buscarSubscriberPorTelefone(cleanPhone);
    subscriberId = subscriber.id;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Subscriber not found, create one
      const newSubscriber = await criarSubscriber(cleanPhone);
      subscriberId = newSubscriber.id;
    } else {
      throw error;
    }
  }

  // Step 2: Send message
  const response = await client.post(`/subscriber/${subscriberId}/send_message/`, {
    type: "text",
    value: payload.message,
  });
  return response.data;
}

/**
 * Dispara um fluxo automatizado para um subscriber.
 * POST /subscriber/{subscriber_id}/send_flow/
 */
export async function dispararFluxo(payload: SendFlowPayload) {
  const client = await getClient();
  const cleanPhone = payload.phone.replace(/\D/g, "");

  // Find subscriber
  let subscriberId: string;
  try {
    const subscriber = await buscarSubscriberPorTelefone(cleanPhone);
    subscriberId = subscriber.id;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const newSubscriber = await criarSubscriber(cleanPhone);
      subscriberId = newSubscriber.id;
    } else {
      throw error;
    }
  }

  const response = await client.post(`/subscriber/${subscriberId}/send_flow/`, {
    flow_id: payload.flowId,
  });
  return response.data;
}

/**
 * Lista fluxos disponíveis.
 * GET /flows/
 */
export async function listarFluxos() {
  const client = await getClient();
  const response = await client.get("/flows/");
  return response.data;
}

/**
 * Lista subscribers (paginado).
 * GET /subscribers/
 */
export async function listarSubscribers(page = 1) {
  const client = await getClient();
  const response = await client.get(`/subscribers/?page=${page}`);
  return response.data;
}

/**
 * Busca informações de um contato pelo telefone.
 */
export async function buscarContato(phone: string) {
  return buscarSubscriberPorTelefone(phone);
}
