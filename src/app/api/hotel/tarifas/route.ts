import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const tarifaSchema = z.object({
  tipoQuarto: z.string(),
  temporada: z.enum(["BAIXA", "MEDIA", "ALTA", "FERIADO"]),
  valorDiaria: z.number().positive(),
  cafeDaManha: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "hotel") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Hotel" }, { status: 403 });
  }

  const key = `hotel_tarifas_${session.tenantId || "default"}`;
  const config = await prisma.systemConfig.findUnique({ where: { key } });

  let tarifas: unknown[] = [];
  if (config) { try { tarifas = JSON.parse(config.value); } catch { /* ignore */ } }

  return NextResponse.json({ success: true, data: tarifas });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "hotel") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Hotel" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = tarifaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const key = `hotel_tarifas_${session.tenantId || "default"}`;
  const config = await prisma.systemConfig.findUnique({ where: { key } });

  let tarifas: unknown[] = [];
  if (config) { try { tarifas = JSON.parse(config.value); } catch { /* ignore */ } }

  (tarifas as Record<string, unknown>[]).push({ id: crypto.randomUUID(), ...parsed.data });

  await prisma.systemConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(tarifas) },
    create: { key, value: JSON.stringify(tarifas) },
  });

  return NextResponse.json({ success: true, data: tarifas }, { status: 201 });
}
