/**
 * Pix Integration Client — SICREDI
 * Segue o padrão BACEN Pix API (spec aberta para todos os PSPs).
 * Documentação: https://developer.sicredi.com.br/api-portal/
 *
 * OAuth2 Client Credentials → /oauth/token
 * Cobranças imediatas → POST /v2/cob
 * QR Code → GET /v2/loc/{id}/qrcode
 * Webhook → PUT /v2/webhook/{chave}
 *
 * Requer:
 * - PIX_CLIENT_ID (obtido no portal Sicredi)
 * - PIX_CLIENT_SECRET
 * - PIX_CERTIFICATE (base64 do .p12 — mTLS obrigatório no Sicredi)
 * - PIX_CHAVE (chave Pix cadastrada na conta Sicredi)
 * - PIX_BASE_URL:
 *   Sandbox: https://api-parceiro.sicredi.com.br/sb
 *   Produção: https://api-parceiro.sicredi.com.br
 */

import axios, { AxiosInstance } from "axios";
import https from "https";
import { prisma } from "@/lib/prisma";

// Token cache
let accessToken: string | null = null;
let tokenExpiry = 0;

interface PixConfig {
  clientId: string;
  clientSecret: string;
  certBase64: string | null;
  baseURL: string;
  chave: string;
}

async function getConfig(): Promise<PixConfig> {
  // Try process.env first
  let clientId = process.env.PIX_CLIENT_ID || "";
  let clientSecret = process.env.PIX_CLIENT_SECRET || "";
  let certBase64 = process.env.PIX_CERTIFICATE || "";
  let baseURL = process.env.PIX_BASE_URL || "https://api-parceiro.sicredi.com.br/sb";
  let chave = process.env.PIX_CHAVE || "";

  // Fallback: read from database
  if (!clientId) {
    const config = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
    if (config) {
      try {
        const settings = JSON.parse(config.value);
        if (settings.pix) {
          clientId = settings.pix.clientId || "";
          clientSecret = settings.pix.clientSecret || "";
          certBase64 = settings.pix.certificateBase64 || "";
          chave = settings.pix.pixKey || "";
          baseURL = settings.pix.environment === "production"
            ? "https://api-parceiro.sicredi.com.br"
            : "https://api-parceiro.sicredi.com.br/sb";

          // Cache in env
          if (clientId) process.env.PIX_CLIENT_ID = clientId;
          if (clientSecret) process.env.PIX_CLIENT_SECRET = clientSecret;
          if (certBase64) process.env.PIX_CERTIFICATE = certBase64;
          if (chave) process.env.PIX_CHAVE = chave;
          process.env.PIX_BASE_URL = baseURL;
        }
      } catch {}
    }
  }

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais Pix Sicredi não configuradas. Vá em Configurações → Integrações → Pix.");
  }

  return { clientId, clientSecret, certBase64: certBase64 || null, baseURL, chave };
}

function createHttpsAgent(certBase64: string | null): https.Agent | undefined {
  if (!certBase64) {
    // Sem certificado — funciona no sandbox do Sicredi e em modo desenvolvimento
    return undefined;
  }
  try {
    const pfx = Buffer.from(certBase64, "base64");
    return new https.Agent({ pfx, passphrase: "" });
  } catch {
    return undefined;
  }
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const { clientId, clientSecret, certBase64, baseURL } = await getConfig();
  const agent = createHttpsAgent(certBase64);

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // Sicredi OAuth2: POST /oauth/token (client_credentials grant)
  const response = await axios.post(
    `${baseURL}/oauth/token`,
    "grant_type=client_credentials&scope=cob.write cob.read pix.read pix.write",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent: agent,
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return accessToken!;
}

async function getClient(): Promise<AxiosInstance> {
  const { baseURL, certBase64 } = await getConfig();
  const token = await getAccessToken();
  const agent = createHttpsAgent(certBase64);

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    httpsAgent: agent,
    timeout: 30000,
  });
}

export interface CobPayload {
  valor: number;
  cpf: string;
  nome: string;
  descricao?: string;
  expiracao?: number; // seconds (default: 3600)
}

export interface CobResponse {
  txid: string;
  qrcode: string;
  imagemQrcode: string;
  pixCopiaECola: string;
  status: string;
}

/**
 * Cria cobrança Pix imediata (cob).
 * POST /v2/cob
 */
export async function criarCobranca(payload: CobPayload): Promise<CobResponse> {
  const client = await getClient();
  const { chave } = await getConfig();

  // Create immediate charge
  const cobResponse = await client.post("/v2/cob", {
    calendario: { expiracao: payload.expiracao || 3600 },
    devedor: {
      cpf: payload.cpf.replace(/\D/g, ""),
      nome: payload.nome,
    },
    valor: { original: payload.valor.toFixed(2) },
    chave,
    solicitacaoPagador: payload.descricao || "Pagamento Hachi Clínica",
  });

  const { txid, loc, status } = cobResponse.data;

  // Get QR code from location
  let qrcode = "";
  let imagemQrcode = "";
  try {
    const qrResponse = await client.get(`/v2/loc/${loc.id}/qrcode`);
    qrcode = qrResponse.data.qrcode || "";
    imagemQrcode = qrResponse.data.imagemQrcode || "";
  } catch {
    // QR code might not be immediately available
  }

  return {
    txid,
    qrcode,
    imagemQrcode,
    pixCopiaECola: qrcode,
    status,
  };
}

/**
 * Consulta cobrança por txid.
 * GET /v2/cob/{txid}
 */
export async function consultarCobranca(txid: string) {
  const client = await getClient();
  const response = await client.get(`/v2/cob/${txid}`);
  return response.data;
}

/**
 * Registra webhook para notificações.
 * PUT /v2/webhook/{chave}
 */
export async function registrarWebhook(webhookUrl: string) {
  const client = await getClient();
  const { chave } = await getConfig();
  const response = await client.put(`/v2/webhook/${chave}`, {
    webhookUrl,
  });
  return response.data;
}

/**
 * Testa conexão (obtém token OAuth).
 */
export async function testarConexao(): Promise<boolean> {
  await getAccessToken();
  return true;
}
