/**
 * NFS-e Integration — Sistema Nacional (nfse.gov.br)
 * 
 * IMPORTANTE: O Sistema Nacional NFS-e NÃO possui API REST pública aberta.
 * A emissão é feita via:
 * 1. Portal Emissor Nacional (nfse.gov.br/EmissorNacional) — login gov.br
 * 2. Webservice SOAP/XML — requer certificado digital A1 + homologação
 * 3. Intermediador (Focus NFe, PlugNotas, nfe.io) — API REST via terceiro
 * 
 * Esta implementação suporta:
 * - Modo "manual": gera os dados da nota no formato correto para copiar/colar no portal
 * - Modo "intermediador": envia via API REST do intermediador configurado
 * 
 * Configuração necessária em Configurações → Integrações → NF-e:
 * - Se usar intermediador: API Key + Company ID
 * - Se usar portal manual: nenhuma config (apenas gera dados formatados)
 */

import axios from "axios";
import { prisma } from "@/lib/prisma";

interface NfseConfig {
  apiKey: string;
  companyId: string;
  baseURL: string;
  mode: "manual" | "intermediador";
}

async function getConfig(): Promise<NfseConfig> {
  let apiKey = process.env.NFE_API_KEY || "";
  let companyId = process.env.NFE_COMPANY_ID || "";
  let baseURL = process.env.NFE_BASE_URL || "https://api.nfe.io";

  // Read from DB
  if (!apiKey) {
    const config = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
    if (config) {
      try {
        const settings = JSON.parse(config.value);
        if (settings.nfe?.apiKey) apiKey = settings.nfe.apiKey;
        if (settings.nfe?.companyId) companyId = settings.nfe.companyId;
        if (settings.nfe?.environment === "production") baseURL = "https://api.nfe.io";
        else baseURL = "https://api.sandbox.nfe.io";
      } catch {}
    }
  }

  const mode = apiKey && companyId ? "intermediador" : "manual";
  return { apiKey, companyId, baseURL, mode };
}

export interface NfsePayload {
  tomadorCpfCnpj: string;
  tomadorNome: string;
  tomadorEmail?: string;
  descricao: string;
  valor: number;
  codigoServico?: string; // Código Item Lista Serviço do município
  aliquotaIss?: number; // Default: 5%
}

export interface NfseResponse {
  id: string;
  numero: string;
  status: string;
  mode: "manual" | "intermediador";
  pdfUrl?: string;
  xmlUrl?: string;
  dadosParaEmissaoManual?: {
    prestador: string;
    tomador: string;
    servico: string;
    valor: string;
    descricao: string;
    codigoServico: string;
    instrucoes: string;
  };
}

/**
 * Emite NFS-e ou prepara dados para emissão manual.
 */
export async function emitirNfse(payload: NfsePayload): Promise<NfseResponse> {
  const config = await getConfig();

  if (config.mode === "intermediador") {
    // Via intermediador (nfe.io, Focus, etc.)
    const client = axios.create({
      baseURL: config.baseURL,
      headers: { Authorization: config.apiKey, "Content-Type": "application/json" },
      timeout: 30000,
    });

    const response = await client.post(`/v1/companies/${config.companyId}/serviceinvoices`, {
      cityServiceCode: payload.codigoServico || "6311900",
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
      status: response.data.status || "EMITIDA",
      mode: "intermediador",
      pdfUrl: response.data.pdfUrl,
      xmlUrl: response.data.xmlUrl,
    };
  }

  // Modo manual: gera dados formatados para emissão no portal nacional
  const dadosFormatados = {
    prestador: "Preencher com dados da clínica (CNPJ, Inscrição Municipal)",
    tomador: `${payload.tomadorNome} - CPF/CNPJ: ${payload.tomadorCpfCnpj}`,
    servico: `Código: ${payload.codigoServico || "8630-5/03"} — Atividades de atenção ambulatorial`,
    valor: `R$ ${payload.valor.toFixed(2)}`,
    descricao: payload.descricao,
    codigoServico: payload.codigoServico || "8630-5/03",
    instrucoes: [
      "1. Acesse nfse.gov.br/EmissorNacional",
      "2. Faça login com sua conta gov.br ou certificado digital",
      "3. Clique em 'Emitir NFS-e'",
      "4. Preencha os dados abaixo no formulário",
      "5. Confira e emita a nota",
    ].join("\n"),
  };

  return {
    id: `manual-${Date.now()}`,
    numero: "Pendente (emissão manual)",
    status: "PENDENTE_EMISSAO_MANUAL",
    mode: "manual",
    dadosParaEmissaoManual: dadosFormatados,
  };
}

/**
 * Consulta NFS-e por ID (apenas modo intermediador).
 */
export async function consultarNfse(nfseId: string) {
  const config = await getConfig();
  if (config.mode !== "intermediador") {
    throw new Error("Consulta automática disponível apenas com intermediador configurado");
  }

  const client = axios.create({
    baseURL: config.baseURL,
    headers: { Authorization: config.apiKey },
    timeout: 30000,
  });

  const response = await client.get(`/v1/companies/${config.companyId}/serviceinvoices/${nfseId}`);
  return response.data;
}

/**
 * Cancela NFS-e (apenas modo intermediador).
 */
export async function cancelarNfse(nfseId: string) {
  const config = await getConfig();
  if (config.mode !== "intermediador") {
    throw new Error("Cancelamento automático disponível apenas com intermediador configurado");
  }

  const client = axios.create({
    baseURL: config.baseURL,
    headers: { Authorization: config.apiKey },
    timeout: 30000,
  });

  const response = await client.delete(`/v1/companies/${config.companyId}/serviceinvoices/${nfseId}`);
  return response.data;
}
