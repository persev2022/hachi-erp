import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const exameSchema = z.object({
  pacienteId: z.string().uuid(),
  tipo: z.string().min(1), // "Hemograma", "Raio-X", etc.
  resultado: z.string().optional(),
  observacoes: z.string().optional(),
  dataRealizacao: z.string().optional(),
  laboratorio: z.string().optional(),
  status: z.enum(["SOLICITADO", "REALIZADO", "RESULTADO_DISPONIVEL"]).default("SOLICITADO"),
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

  const where: Record<string, unknown> = { titulo: { startsWith: "EXAME:" } };
  if (pacienteId) where.pacienteId = pacienteId;

  const exames = await prisma.documento.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });

  return NextResponse.json({
    success: true,
    data: exames.map((e) => {
      let p = {};
      try { p = JSON.parse(e.arquivo); } catch { /* ignore */ }
      return { id: e.id, ...p, createdAt: e.createdAt };
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "clinic") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Clinic" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = exameSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const doc = await prisma.documento.create({
    data: {
      pacienteId: parsed.data.pacienteId,
      tipo: "OUTRO",
      titulo: `EXAME:${parsed.data.tipo}`,
      arquivo: JSON.stringify(parsed.data),
      formato: "json",
      geradoPor: session.userId,
    },
  });

  return NextResponse.json({ success: true, data: { id: doc.id, ...parsed.data, createdAt: doc.createdAt } }, { status: 201 });
}
