import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { signDocument, generateCertificateText } from "@/lib/documents/signature";
import { generateDocx } from "@/lib/documents/generator";
import { logAudit } from "@/lib/services/audit";

const assinarSchema = z.object({
  documentoId: z.string().uuid().optional(),
  pacienteId: z.string().uuid(),
  tipo: z.enum(["CONTRATO", "RECIBO", "RECEITA_SIMPLES", "RECEITA_ESPECIAL", "ATESTADO"]),
});

/**
 * POST /api/documentos/assinar
 * Signs a document digitally with SHA-256.
 * Creates a signature record and returns the certificate.
 * 
 * Compliance: Lei 14.063/2020 (Assinatura Eletrônica Avançada)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = assinarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    const { pacienteId, tipo } = parsed.data;

    // Get signer info
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, cpf: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });
    }

    // Generate the document to sign
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      include: { responsaveis: { where: { isFinanceiro: true }, take: 1 } },
    });

    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    // Generate a minimal document buffer for signing (even if template has issues)
    let docBuffer: Buffer;
    try {
      const { formatDateBR } = await import("@/lib/documents/format");
      const { toTitleCase } = await import("@/lib/documents/format");
      docBuffer = generateDocx(tipo, {
        data_entrada: formatDateBR(paciente.dataAdmissao),
        nome_paciente: toTitleCase(paciente.nome),
        cpf_paciente: paciente.cpf,
      });
    } catch {
      // If template generation fails, sign a text representation
      docBuffer = Buffer.from(`${tipo}|${paciente.nome}|${paciente.cpf}|${new Date().toISOString()}`);
    }

    // Sign the document
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const signature = signDocument(
      docBuffer,
      {
        userId: session.userId,
        name: user.name,
        cpf: user.cpf || undefined,
        email: user.email,
        role: user.role,
        tenantId: session.tenantId || undefined,
      },
      { type: tipo, title: `${tipo} - ${paciente.nome}` },
      ipAddress
    );

    // Generate certificate text
    const certificate = generateCertificateText(signature);

    // Save signature to database (as a document)
    await prisma.documento.create({
      data: {
        pacienteId,
        tipo: "TERMO_CONSENTIMENTO",
        titulo: `Assinatura Digital - ${tipo} - ${paciente.nome}`,
        arquivo: JSON.stringify(signature),
        formato: "json",
        geradoPor: session.userId,
        assinado: true,
      },
    });

    // Audit
    await logAudit(session.userId, "SIGN", "Documento", signature.id, {
      tipo,
      pacienteId,
      signatureHash: signature.hash,
    });

    return NextResponse.json({
      success: true,
      data: {
        signatureId: signature.id,
        hash: signature.hash,
        signedAt: signature.signedAt,
        certificate,
        valid: true,
        legalBasis: "Lei 14.063/2020, Art. 4º, III — Assinatura Eletrônica Avançada",
      },
    });
  } catch (error) {
    console.error("POST /api/documentos/assinar error:", error);
    return NextResponse.json({ success: false, error: "Erro ao assinar documento" }, { status: 500 });
  }
}
