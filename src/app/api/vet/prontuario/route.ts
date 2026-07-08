import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const prontuarioSchema = z.object({
  pacienteId: z.string().uuid(),
  especie: z.string().min(1),
  raca: z.string().optional(),
  peso: z.number().optional(),
  temperatura: z.number().optional(),
  queixaPrincipal: z.string().min(1),
  diagnostico: z.string().optional(),
  tratamento: z.string().optional(),
  profissional: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    // Check vertical
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
      if (tenant?.vertical !== "vet") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Vet" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");

    if (!pacienteId) {
      return NextResponse.json({ success: false, error: "pacienteId é obrigatório" }, { status: 400 });
    }

    // Get vet records for this animal
    const documentos = await prisma.documento.findMany({
      where: {
        pacienteId,
        titulo: { startsWith: "VET:" },
      },
      orderBy: { createdAt: "desc" },
    });

    const prontuarios = documentos.map((doc) => {
      try {
        return { id: doc.id, ...JSON.parse(doc.arquivo), createdAt: doc.createdAt };
      } catch {
        return { id: doc.id, titulo: doc.titulo, createdAt: doc.createdAt };
      }
    });

    return NextResponse.json({ success: true, data: prontuarios });
  } catch (error) {
    console.error("GET /api/vet/prontuario error:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    // Check vertical
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
      if (tenant?.vertical !== "vet") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Vet" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = prontuarioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { pacienteId, queixaPrincipal, ...rest } = parsed.data;

    // Store as Documento
    const documento = await prisma.documento.create({
      data: {
        pacienteId,
        tipo: "OUTRO",
        titulo: `VET:${queixaPrincipal.slice(0, 30)}`,
        arquivo: JSON.stringify({ pacienteId, queixaPrincipal, ...rest }),
        formato: "json",
        geradoPor: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: documento.id,
        pacienteId,
        queixaPrincipal,
        ...rest,
        createdAt: documento.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/vet/prontuario error:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}
