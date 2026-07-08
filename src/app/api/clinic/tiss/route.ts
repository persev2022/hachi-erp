import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const tissSchema = z.object({
  pacienteId: z.string().uuid(),
  convenioId: z.string(),
  tipoGuia: z.enum(["CONSULTA", "SADT", "INTERNACAO", "HONORARIOS"]),
  procedimento: z.string(),
  valorAutorizado: z.number().optional(),
  numeroGuia: z.string().optional(),
  status: z.enum(["PENDENTE", "AUTORIZADA", "NEGADA", "FATURADA"]).default("PENDENTE"),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "clinic") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Clinic" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  // Store TISS as documents with tipo OUTRO and specific titulo prefix
  const where: Record<string, unknown> = { titulo: { startsWith: "TISS:" } };
  if (pacienteId) where.pacienteId = pacienteId;

  const guias = await prisma.documento.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: guias.map((g) => {
      let parsed = {};
      try { parsed = JSON.parse(g.arquivo); } catch { /* ignore */ }
      return { id: g.id, ...parsed, createdAt: g.createdAt };
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "clinic") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Clinic" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = tissSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const doc = await prisma.documento.create({
    data: {
      pacienteId: parsed.data.pacienteId,
      tipo: "OUTRO",
      titulo: `TISS:${parsed.data.tipoGuia}`,
      arquivo: JSON.stringify(parsed.data),
      formato: "json",
      geradoPor: session.userId,
    },
  });

  return NextResponse.json({ success: true, data: { id: doc.id, ...parsed.data, createdAt: doc.createdAt } }, { status: 201 });
}
