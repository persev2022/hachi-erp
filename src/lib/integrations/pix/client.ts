import axios, { AxiosInstance } from "axios";

/**
 * Cliente para a API Pix do BACEN.
 *
 * Referência OpenAPI: https://github.com/bacen/pix-api/blob/master/openapi.yaml
 *
 * Endpoints principais:
 * - POST /cob     → Criar cobrança imediata
 * - GET  /cob/:txid → Consultar cobrança
 * - POST /cobv    → Criar cobrança com vencimento
 * - GET  /pix     → Listar Pix recebidos
 * - PUT  /webhook/:chave → Configurar webhook
 *
 * Auth: OAuth2 com certificado mTLS (client_id + client_secret + certificado)
 */

interface PixConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  certificatePath: string; // Caminho do certificado .pem
  pixKey: string;          // Chave Pix da clínica
}

function getPixConfig(): PixConfig {
  return {
    baseUrl: process.env.PIX_BASE_URL || "",
    clientId: process.env.PIX_CLIENT_ID || "",
    clientSecret: process.env.PIX_CLIENT_SECRET || "",
    certificatePath: process.env.PIX_CERTIFICATE_PATH || "",
    pixKey: process.env.PIX_KEY || "",
  };
}

export interface CobImediata {
  calendario: { expiracao: number }; // segundos
  devedor?: { cpf?: string; cnpj?: string; nome: string };
  valor: { original: string }; // "150.00"
  chave: string;
  solicitacaoPagador?: string;
  infoAdicionais?: Array<{ nome: string; valor: string }>;
}

export interface CobVencimento {
  calendario: { dataDeVencimento: string; validadeAposVencimento?: number };
  devedor: { cpf?: string; cnpj?: string; nome: string };
  valor: { original: string };
  chave: string;
  solicitacaoPagador?: string;
}

export interface PixResponse {
  txid: string;
  status: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
  location: string; // URL para QR Code
  pixCopiaECola: string;
}

export const pixApi = {
  /**
   * Cria uma cobrança Pix imediata.
   */
  async criarCobImediata(txid: string, cobranca: CobImediata): Promise<PixResponse> {
    const config = getPixConfig();
    // Em produção, usar certificado mTLS via https agent
    const response = await axios.put(`${config.baseUrl}/cob/${txid}`, cobranca, {
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  /**
   * Cria uma cobrança Pix com vencimento.
   */
  async criarCobVencimento(txid: string, cobranca: CobVencimento): Promise<PixResponse> {
    const config = getPixConfig();
    const response = await axios.put(`${config.baseUrl}/cobv/${txid}`, cobranca, {
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  /**
   * Consulta o status de uma cobrança.
   */
  async consultarCob(txid: string): Promise<PixResponse> {
    const config = getPixConfig();
    const response = await axios.get(`${config.baseUrl}/cob/${txid}`, {
      headers: { Authorization: `Bearer ${await getAccessToken()}` },
    });
    return response.data;
  },

  /**
   * Registra um webhook para receber notificações de pagamento.
   */
  async registrarWebhook(webhookUrl: string) {
    const config = getPixConfig();
    return axios.put(
      `${config.baseUrl}/webhook/${config.pixKey}`,
      { webhookUrl },
      { headers: { Authorization: `Bearer ${await getAccessToken()}` } }
    );
  },
};

/**
 * Obtém access token via OAuth2 (client credentials).
 * Em produção, cachear o token até expiração.
 */
async function getAccessToken(): Promise<string> {
  const config = getPixConfig();
  const response = await axios.post(
    `${config.baseUrl}/oauth/token`,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      auth: { username: config.clientId, password: config.clientSecret },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return response.data.access_token;
}
