import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET — Public: fetch form data by token (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: `form_link_${token}` },
    });

    if (!config) {
      return NextResponse.json({ success: false, error: "Link não encontrado ou expirado" }, { status: 404 });
    }

    const data = JSON.parse(config.value);
    return NextResponse.json({
      success: true,
      data: {
        tipo: data.tipo,
        status: data.status,
        dados: data.dados,
        assinado: data.status === "assinado",
      },
    });
  } catch (error) {
    console.error("Form GET error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

// POST — Public: submit form data + signature (no auth required)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: `form_link_${token}` },
    });

    if (!config) {
      return NextResponse.json({ success: false, error: "Link não encontrado" }, { status: 404 });
    }

    const existing = JSON.parse(config.value);

    if (existing.status === "assinado") {
      return NextResponse.json({ success: false, error: "Este formulário já foi assinado" }, { status: 400 });
    }

    const body = await req.json();
    const { dados, assinaturaNome, assinaturaIP } = body;

    if (!dados || !assinaturaNome) {
      return NextResponse.json({ success: false, error: "Dados e assinatura são obrigatórios" }, { status: 400 });
    }

    // Generate SHA-256 hash of the document content
    const documentContent = JSON.stringify({ ...dados, assinaturaNome, timestamp: new Date().toISOString() });
    const hash = crypto.createHash("sha256").update(documentContent).digest("hex");

    const updated = {
      ...existing,
      status: "assinado",
      dados,
      assinatura: {
        nome: assinaturaNome,
        ip: assinaturaIP || req.headers.get("x-forwarded-for") || "unknown",
        hash,
        algoritmo: "SHA-256",
        dataHora: new Date().toISOString(),
        valido: true,
      },
    };

    await prisma.systemConfig.update({
      where: { key: config.key },
      data: { value: JSON.stringify(updated) },
    });

    return NextResponse.json({
      success: true,
      data: {
        hash,
        assinadoEm: updated.assinatura.dataHora,
        message: "Documento assinado com sucesso",
      },
    });
  } catch (error) {
    console.error("Form POST error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
