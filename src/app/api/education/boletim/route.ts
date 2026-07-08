import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const boletimSchema = z.object({
  pacienteId: z.string().uuid(),
  disciplina: z.string().min(1),
  bimestre: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  nota: z.number().min(0).max(10),
  faltas: z.number().min(0).optional(),
  observacoes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    // Check vertical
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
      if (tenant?.vertical !== "education") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Education" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");

    if (!pacienteId) {
      return NextResponse.json({ success: false, error: "pacienteId é obrigatório" }, { status: 400 });
    }

    // Get boletim documents for this student
    const documentos = await prisma.documento.findMany({
      where: {
        pacienteId,
        titulo: { startsWith: "BOLETIM:" },
      },
      orderBy: { createdAt: "desc" },
    });

    const boletins = documentos.map((doc) => {
      try {
        return { id: doc.id, ...JSON.parse(doc.arquivo), createdAt: doc.createdAt };
      } catch {
        return { id: doc.id, titulo: doc.titulo, createdAt: doc.createdAt };
      }
    });

    return NextResponse.json({ success: true, data: boletins });
  } catch (error) {
    console.error("GET /api/education/boletim error:", error);
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
      if (tenant?.vertical !== "education") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Education" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = boletimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { pacienteId, disciplina, bimestre, ...rest } = parsed.data;

    // Store as Documento
    const documento = await prisma.documento.create({
      data: {
        pacienteId,
        tipo: "OUTRO",
        titulo: `BOLETIM:${disciplina}:${bimestre}`,
        arquivo: JSON.stringify({ pacienteId, disciplina, bimestre, ...rest }),
        formato: "json",
        geradoPor: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: documento.id,
        pacienteId,
        disciplina,
        bimestre,
        ...rest,
        createdAt: documento.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/education/boletim error:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}
