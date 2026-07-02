/**
 * NFS-e Integration Client (nfe.io).
 * Emits service invoices for healthcare services.
 *
 * Requires env vars:
 * - NFE_API_KEY
 * - NFE_COMPANY_ID
 * - NFE_BASE_URL (default: https://api.nfe.io)
 */

import axios from "axios";

function getClient() {
  const apiKey = process.env.NFE_API_KEY;
  const companyId = process.env.NFE_COMPANY_ID;
  const baseURL = process.env.NFE_BASE_URL || "https://api.nfe.io";

  if (!apiKey || !companyId) {
    throw new Error("NFE_API_KEY e NFE_COMPANY_ID não configurados");
  }

  return {
    client: axios.create({
      baseURL,
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }),
    companyId,
  };
}

export interface NfsePayload {
  tomadorCpfCnpj: string;
  tomadorNome: string;
  tomadorEmail?: string;
  descricao: string;
  valor: number;
  aliquotaIss?: number; // Default: 5%
}

export interface NfseResponse {
  id: string;
  numero: string;
  status: string;
  pdfUrl?: string;
  xmlUrl?: string;
}

/**
 * Emits a NFS-e (nota fiscal de serviço eletrônica).
 */
export async function emitirNfse(payload: NfsePayload): Promise<NfseResponse> {
  const { client, companyId } = getClient();

  const response = await client.post(`/v1/companies/${companyId}/serviceinvoices`, {
    cityServiceCode: "6311900", // Serviços de saúde — ajustar conforme município
    description: payload.descricao,
    servicesAmount: payload.valor,
    borrower: {
      federalTaxNumber: payload.tomadorCpfCnpj.replace(/\D/g, ""),
      name: payload.tomadorNome,
      email: payload.tomadorEmail,
    },
    issRate: payload.aliquotaIss || 5,
  });

  return {
    id: response.data.id,
    numero: response.data.number || response.data.id,
    status: response.data.status,
    pdfUrl: response.data.pdfUrl,
    xmlUrl: response.data.xmlUrl,
  };
}

/**
 * Query an existing NFS-e by ID.
 */
export async function consultarNfse(nfseId: string) {
  const { client, companyId } = getClient();
  const response = await client.get(`/v1/companies/${companyId}/serviceinvoices/${nfseId}`);
  return response.data;
}

/**
 * Cancel an existing NFS-e by ID.
 */
export async function cancelarNfse(nfseId: string) {
  const { client, companyId } = getClient();
  const response = await client.delete(`/v1/companies/${companyId}/serviceinvoices/${nfseId}`);
  return response.data;
}
