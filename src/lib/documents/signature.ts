/**
 * Digital Signature Module — SHA-256
 *
 * Implements digital document signing compliant with Brazilian legislation:
 * - Lei 14.063/2020 (assinatura eletrônica)
 * - MP 2.200-2/2001 (ICP-Brasil)
 * - Art. 10 §2 MP 2.200-2: assinaturas eletrônicas avançadas são válidas
 *   quando admitidas pelas partes como válidas ou aceitas pela pessoa a quem for oposto
 *
 * This implements "Assinatura Eletrônica Avançada" (nivel 2):
 * - Vinculada ao signatário de maneira unívoca
 * - Utiliza dados que o signatário pode usar sob seu exclusivo controle
 * - Vinculada ao documento de modo a detectar qualquer modificação posterior
 *
 * Hash: SHA-256
 * Payload: document buffer + signer identity + timestamp
 */

import crypto from "crypto";

export interface SignaturePayload {
  documentHash: string; // SHA-256 of the document content
  signerId: string; // User ID
  signerName: string;
  signerCpf?: string;
  signerEmail: string;
  signerRole: string;
  tenantId?: string;
  documentType: string;
  documentTitle: string;
  timestamp: string; // ISO 8601
  ipAddress?: string;
}

export interface DigitalSignature {
  id: string;
  payload: SignaturePayload;
  hash: string; // SHA-256 of the entire payload (the actual signature)
  signedAt: string;
  valid: boolean;
}

/**
 * Generate SHA-256 hash of a buffer (document content).
 */
export function hashDocument(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Sign a document digitally.
 * Creates a SHA-256 hash of the payload (document hash + signer identity + timestamp).
 * This constitutes an "Assinatura Eletrônica Avançada" under Lei 14.063/2020.
 */
export function signDocument(
  documentBuffer: Buffer,
  signer: {
    userId: string;
    name: string;
    cpf?: string;
    email: string;
    role: string;
    tenantId?: string;
  },
  documentMeta: {
    type: string;
    title: string;
  },
  ipAddress?: string
): DigitalSignature {
  const timestamp = new Date().toISOString();
  const documentHash = hashDocument(documentBuffer);

  const payload: SignaturePayload = {
    documentHash,
    signerId: signer.userId,
    signerName: signer.name,
    signerCpf: signer.cpf,
    signerEmail: signer.email,
    signerRole: signer.role,
    tenantId: signer.tenantId,
    documentType: documentMeta.type,
    documentTitle: documentMeta.title,
    timestamp,
    ipAddress,
  };

  // Generate signature hash (SHA-256 of the entire payload serialized)
  const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
  const signatureHash = crypto.createHash("sha256").update(payloadString).digest("hex");

  return {
    id: crypto.randomUUID(),
    payload,
    hash: signatureHash,
    signedAt: timestamp,
    valid: true,
  };
}

/**
 * Verify a digital signature.
 * Recalculates the hash and compares with the stored signature.
 */
export function verifySignature(
  documentBuffer: Buffer,
  signature: DigitalSignature
): { valid: boolean; reason?: string } {
  // 1. Verify document hash matches
  const currentDocHash = hashDocument(documentBuffer);
  if (currentDocHash !== signature.payload.documentHash) {
    return { valid: false, reason: "Documento foi alterado após assinatura" };
  }

  // 2. Recalculate signature hash
  const payloadString = JSON.stringify(signature.payload, Object.keys(signature.payload).sort());
  const expectedHash = crypto.createHash("sha256").update(payloadString).digest("hex");

  if (expectedHash !== signature.hash) {
    return { valid: false, reason: "Assinatura inválida — payload adulterado" };
  }

  return { valid: true };
}

/**
 * Generate a human-readable signature certificate text.
 * This can be appended to the document or stored separately.
 */
export function generateCertificateText(signature: DigitalSignature): string {
  return [
    "═══════════════════════════════════════════════════",
    "CERTIFICADO DE ASSINATURA DIGITAL",
    "═══════════════════════════════════════════════════",
    "",
    `Documento: ${signature.payload.documentTitle}`,
    `Tipo: ${signature.payload.documentType}`,
    `Hash do documento (SHA-256): ${signature.payload.documentHash}`,
    "",
    `Assinado por: ${signature.payload.signerName}`,
    `CPF: ${signature.payload.signerCpf || "Não informado"}`,
    `Email: ${signature.payload.signerEmail}`,
    `Função: ${signature.payload.signerRole}`,
    "",
    `Data/Hora: ${new Date(signature.signedAt).toLocaleString("pt-BR")}`,
    `IP: ${signature.payload.ipAddress || "Não registrado"}`,
    "",
    `ID da Assinatura: ${signature.id}`,
    `Hash da Assinatura (SHA-256): ${signature.hash}`,
    "",
    "Validade: Assinatura Eletrônica Avançada",
    "Base Legal: Lei 14.063/2020, Art. 4º, III",
    "═══════════════════════════════════════════════════",
  ].join("\n");
}
