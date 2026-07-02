/**
 * Pix Integration Client (EFI/Gerencianet).
 * Implements immediate charge (cob) and QR code generation.
 * 
 * Requires env vars:
 * - PIX_CLIENT_ID
 * - PIX_CLIENT_SECRET
 * - PIX_CERTIFICATE (base64 encoded .p12)
 * - PIX_BASE_URL (sandbox or production)
 * - PIX_CHAVE (Pix key)
 */

import axios, { AxiosInstance } from "axios";
import https from "https";

let accessToken: string | null = null;
let tokenExpiry = 0;

function getConfig() {
  const clientId = process.env.PIX_CLIENT_ID;
  const clientSecret = process.env.PIX_CLIENT_SECRET;
  const certBase64 = process.env.PIX_CERTIFICATE;
  const baseURL = process.env.PIX_BASE_URL || "https://pix-h.api.efipay.com.br"; // sandbox
  const chave = process.env.PIX_CHAVE;

  if (!clientId || !clientSecret) {
    throw new Error("PIX_CLIENT_ID e PIX_CLIENT_SECRET não configurados");
  }

  return { clientId, clientSecret, certBase64, baseURL, chave };
}

function createHttpsAgent(): https.Agent | undefined {
  const { certBase64 } = getConfig();
  if (!certBase64) return undefined;

  const pfx = Buffer.from(certBase64, "base64");
  return new https.Agent({ pfx, passphrase: "" });
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const { clientId, clientSecret, baseURL } = getConfig();
  const agent = createHttpsAgent();

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    `${baseURL}/oauth/token`,
    { grant_type: "client_credentials" },
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      httpsAgent: agent,
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return accessToken!;
}

async function getClient(): Promise<AxiosInstance> {
  const { baseURL } = getConfig();
  const token = await getAccessToken();
  const agent = createHttpsAgent();

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    httpsAgent: agent,
    timeout: 15000,
  });
}

export interface CobPayload {
  valor: number; // em reais (ex: 150.00)
  cpf: string;
  nome: string;
  descricao?: string;
  expiracao?: number; // segundos (default: 3600 = 1h)
}

export interface CobResponse {
  txid: string;
  qrcode: string; // text for QR Code
  imagemQrcode: string; // base64 PNG
  pixCopiaECola: string;
  status: string;
}

/**
 * Creates an immediate Pix charge (cobrança imediata).
 */
export async function criarCobranca(payload: CobPayload): Promise<CobResponse> {
  const client = await getClient();
  const { chave } = getConfig();

  // Create charge
  const cobResponse = await client.post("/v2/cob", {
    calendario: { expiracao: payload.expiracao || 3600 },
    devedor: { cpf: payload.cpf.replace(/\D/g, ""), nome: payload.nome },
    valor: { original: payload.valor.toFixed(2) },
    chave,
    solicitacaoPagador: payload.descricao || "Pagamento Hachi Clínica",
  });

  const { txid, loc } = cobResponse.data;

  // Get QR code
  const qrResponse = await client.get(`/v2/loc/${loc.id}/qrcode`);

  return {
    txid,
    qrcode: qrResponse.data.qrcode,
    imagemQrcode: qrResponse.data.imagemQrcode,
    pixCopiaECola: qrResponse.data.qrcode,
    status: cobResponse.data.status,
  };
}

/**
 * Check charge status by txid.
 */
export async function consultarCobranca(txid: string) {
  const client = await getClient();
  const response = await client.get(`/v2/cob/${txid}`);
  return response.data;
}

/**
 * Register webhook URL for Pix notifications.
 */
export async function registrarWebhook(webhookUrl: string) {
  const client = await getClient();
  const { chave } = getConfig();
  const response = await client.put(`/v2/webhook/${chave}`, {
    webhookUrl,
  });
  return response.data;
}
