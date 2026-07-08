import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const reservaSchema = z.object({
  hospedeNome: z.string().min(2),
  hospedeTelefone: z.string().optional(),
  quartoId: z.string().uuid(),
  checkin: z.string(), // ISO date
  checkout: z.string(), // ISO date
  adultos: z.number().default(1),
  criancas: z.number().default(0),
  valorTotal: z.number().optional(),
  observacoes: z.string().optional(),
  status: z.enum(["RESERVADO", "CHECKIN", "HOSPEDADO", "CHECKOUT", "CANCELADO", "NO_SHOW"]).default("RESERVADO"),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "hotel") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Hotel" }, { status: 403 });
  }

  const key = `hotel_reservas_${session.tenantId || "default"}`;
  const config = await prisma.systemConfig.findUnique({ where: { key } });

  let reservas: unknown[] = [];
  if (config) { try { reservas = JSON.parse(config.value); } catch { /* ignore */ } }

  return NextResponse.json({ success: true, data: reservas });
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
  const parsed = reservaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const key = `hotel_reservas_${session.tenantId || "default"}`;
  const config = await prisma.systemConfig.findUnique({ where: { key } });

  let reservas: unknown[] = [];
  if (config) { try { reservas = JSON.parse(config.value); } catch { /* ignore */ } }

  const newReserva = { id: crypto.randomUUID(), ...parsed.data, createdAt: new Date().toISOString() };
  (reservas as Record<string, unknown>[]).push(newReserva);

  await prisma.systemConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(reservas) },
    create: { key, value: JSON.stringify(reservas) },
  });

  return NextResponse.json({ success: true, data: newReserva }, { status: 201 });
}
