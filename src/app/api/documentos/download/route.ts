import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Download a document by ID
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const documentoId = searchParams.get("id");

    if (!documentoId) {
      return NextResponse.json(
        { success: false, error: "ID do documento é obrigatório" },
        { status: 400 }
      );
    }

    // Find document with tenant isolation
    const documento = await prisma.documento.findFirst({
      where: {
        id: documentoId,
        ...(session.tenantId ? { paciente: { tenantId: session.tenantId } } : {}),
      },
    });

    if (!documento) {
      return NextResponse.json(
        { success: false, error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    // Check if the arquivo field contains a valid base64 document
    const arquivo = documento.arquivo;

    if (!arquivo || !arquivo.startsWith("base64:")) {
      return NextResponse.json(
        { success: false, error: "Arquivo não disponível para download" },
        { status: 404 }
      );
    }

    // Extract base64 content (remove "base64:" prefix)
    const base64Content = arquivo.slice(7); // Remove "base64:" prefix
    const buffer = Buffer.from(base64Content, "base64");

    // Determine content type based on format
    const contentType =
      documento.formato === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const extension = documento.formato === "pdf" ? "pdf" : "docx";
    const fileName = `${documento.titulo}.${extension}`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("GET /api/documentos/download error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao baixar documento" },
      { status: 500 }
    );
  }
}
