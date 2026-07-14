import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — Admin: lista todas as captações do tenant
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { startsWith: `captacao_${session.tenantId}_` } },
    });

    const captacoes = configs
      .map((c) => { try { return JSON.parse(c.value); } catch { return null; } })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return NextResponse.json({ success: true, data: captacoes });
  } catch (error) {
    console.error("Captadores GET error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

// POST — Público: captador envia questionário (sem auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dados, tenantSlug } = body;

    if (!dados || !dados.pacienteNome || !dados.captadorNome) {
      return NextResponse.json({ success: false, error: "Dados do paciente e captador são obrigatórios" }, { status: 400 });
    }

    // Find tenant by slug (default to ct-persev if not specified)
    const slug = tenantSlug || "ct-persev";
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Instituição não encontrada" }, { status: 404 });
    }

    const id = crypto.randomUUID();

    await prisma.systemConfig.create({
      data: {
        key: `captacao_${tenant.id}_${id}`,
        value: JSON.stringify({
          id,
          tenantId: tenant.id,
          status: "pendente", // pendente | aceito | recusado
          criadoEm: new Date().toISOString(),
          dados,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id, message: "Captação enviada com sucesso. A equipe analisará os dados." },
    });
  } catch (error) {
    console.error("Captadores POST error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
