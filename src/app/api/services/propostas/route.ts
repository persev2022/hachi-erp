import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const propostaSchema = z.object({
  clienteNome: z.string().min(1),
  clienteEmail: z.string().email().optional(),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  valor: z.number().min(0),
  validade: z.string().optional(), // ISO date
  status: z.enum(["RASCUNHO", "ENVIADA", "APROVADA", "REJEITADA", "EXPIRADA"]).default("RASCUNHO"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    // Check vertical
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { vertical: true } });
      if (tenant?.vertical !== "services") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Services" }, { status: 403 });
    }

    const key = `services_propostas_${session.tenantId || "default"}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });

    let propostas: unknown[] = [];
    if (config) { try { propostas = JSON.parse(config.value); } catch { /* ignore */ } }

    return NextResponse.json({ success: true, data: propostas });
  } catch (error) {
    console.error("GET /api/services/propostas error:", error);
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
      if (tenant?.vertical !== "services") return NextResponse.json({ success: false, error: "Recurso exclusivo da vertical Services" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = propostaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const key = `services_propostas_${session.tenantId || "default"}`;
    const config = await prisma.systemConfig.findUnique({ where: { key } });

    let propostas: unknown[] = [];
    if (config) { try { propostas = JSON.parse(config.value); } catch { /* ignore */ } }

    const newProposta = { id: crypto.randomUUID(), ...parsed.data, createdAt: new Date().toISOString() };
    (propostas as Record<string, unknown>[]).push(newProposta);

    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(propostas) },
      create: { key, value: JSON.stringify(propostas) },
    });

    return NextResponse.json({ success: true, data: newProposta }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services/propostas error:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}
