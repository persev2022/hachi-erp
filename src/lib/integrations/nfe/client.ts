import axios from "axios";

/**
 * Cliente para emissão de NF-e/NFS-e.
 *
 * Referência: https://github.com/ZeusAutomacao/DFe.NET (implementação .NET)
 *
 * Para o contexto Node.js/TypeScript, usamos uma abordagem via API REST,
 * podendo conectar a um serviço de emissão (ex: nfe.io, eNotas, Focus NFe)
 * ou implementar comunicação direta com SEFAZ/Prefeitura via webservice SOAP.
 *
 * Configuração via variáveis de ambiente:
 * - NFE_PROVIDER: "nfeio" | "enotas" | "focusnfe" | "custom"
 * - NFE_API_KEY: chave da API do provedor
 * - NFE_BASE_URL: URL base do provedor
 * - NFE_CNPJ: CNPJ do emitente
 * - NFE_INSCRICAO_MUNICIPAL: Inscrição municipal
 */

interface NFeConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  cnpj: string;
  inscricaoMunicipal: string;
}

function getNFeConfig(): NFeConfig {
  return {
    provider: process.env.NFE_PROVIDER || "nfeio",
    apiKey: process.env.NFE_API_KEY || "",
    baseUrl: process.env.NFE_BASE_URL || "",
    cnpj: process.env.NFE_CNPJ || "",
    inscricaoMunicipal: process.env.NFE_INSCRICAO_MUNICIPAL || "",
  };
}

export interface DadosNFSe {
  tomador: {
    cpf?: string;
    cnpj?: string;
    razaoSocial: string;
    email?: string;
    endereco?: {
      logradouro: string;
      numero: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
  };
  servico: {
    descricao: string;
    codigoServico: string; // Código do serviço (LC 116)
    valorServico: number;
    aliquotaIss?: number;
  };
  competencia: string; // YYYY-MM
}

export interface NFSeResponse {
  id: string;
  numero: string;
  status: "AUTORIZADA" | "PENDENTE" | "CANCELADA" | "ERRO";
  linkPdf?: string;
  linkXml?: string;
  codigoVerificacao?: string;
  dataEmissao: string;
}

export const nfeApi = {
  /**
   * Emite uma NFS-e (Nota Fiscal de Serviço Eletrônica).
   */
  async emitirNFSe(dados: DadosNFSe): Promise<NFSeResponse> {
    const config = getNFeConfig();
    const response = await axios.post(`${config.baseUrl}/nfse`, dados, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  /**
   * Consulta o status de uma NFS-e.
   */
  async consultarNFSe(id: string): Promise<NFSeResponse> {
    const config = getNFeConfig();
    const response = await axios.get(`${config.baseUrl}/nfse/${id}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    return response.data;
  },

  /**
   * Cancela uma NFS-e emitida.
   */
  async cancelarNFSe(id: string, motivo: string): Promise<void> {
    const config = getNFeConfig();
    await axios.delete(`${config.baseUrl}/nfse/${id}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      data: { motivo },
    });
  },

  /**
   * Lista NFS-e emitidas em um período.
   */
  async listarNFSe(inicio: string, fim: string): Promise<NFSeResponse[]> {
    const config = getNFeConfig();
    const response = await axios.get(`${config.baseUrl}/nfse`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      params: { inicio, fim },
    });
    return response.data;
  },
};
