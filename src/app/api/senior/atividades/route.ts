import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const atividadeSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  diaSemana: z.array(z.enum(["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"])),
  horario: z.string(),
  responsavel: z.string().optional(),
  capacidade: z.number().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  // Check vertical
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
    if (tenant?.vertical !== "senior") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Senior" }, { status: 403 });
  }

  // Store activities in SystemConfig per tenant
  const key = `senior_atividades_${session.tenantId || "default"}`;
  const config = await prisma.systemConfig.findUnique({ where: { key } });

  let atividades: unknown[] = [];
  if (config) { try { atividades = JSON.parse(config.value); } catch { /* ignore */ } }

  return NextResponse.json({ success: true, data: atividades });
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
  const parsed = atividadeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const key = `senior_atividades_${session.tenantId || "default"}`;
  const config = await prisma.systemConfig.findUnique({ where: { key } });

  let atividades: unknown[] = [];
  if (config) { try { atividades = JSON.parse(config.value); } catch { /* ignore */ } }

  atividades.push({ id: crypto.randomUUID(), ...parsed.data, createdAt: new Date().toISOString() });

  await prisma.systemConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(atividades) },
    create: { key, value: JSON.stringify(atividades) },
  });

  return NextResponse.json({ success: true, data: atividades }, { status: 201 });
}
