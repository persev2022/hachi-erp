import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const medicacaoSchema = z.object({
  pacienteId: z.string().uuid(),
  medicamento: z.string().min(1),
  dosagem: z.string(),
  horarios: z.array(z.string()), // ["08:00", "14:00", "20:00"]
  observacoes: z.string().optional(),
  ativa: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "senior") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Senior" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  const where: Record<string, unknown> = { titulo: { startsWith: "MED:" } };
  if (pacienteId) where.pacienteId = pacienteId;

  const meds = await prisma.documento.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });

  return NextResponse.json({
    success: true,
    data: meds.map((m) => {
      let p = {};
      try { p = JSON.parse(m.arquivo); } catch { /* ignore */ }
      return { id: m.id, ...p, createdAt: m.createdAt };
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "senior") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Senior" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = medicacaoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const doc = await prisma.documento.create({
    data: {
      pacienteId: parsed.data.pacienteId,
      tipo: "OUTRO",
      titulo: `MED:${parsed.data.medicamento}`,
      arquivo: JSON.stringify(parsed.data),
      formato: "json",
      geradoPor: session.userId,
    },
  });

  return NextResponse.json({ success: true, data: { id: doc.id, ...parsed.data } }, { status: 201 });
}
