import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  if (session.role !== "ADMIN" && session.role !== "COORDENADOR") {
    return NextResponse.json({ success: false, error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const configKey = `captacao_${session.tenantId}_${id}`;

    const config = await prisma.systemConfig.findFirst({ where: { key: configKey } });
    if (!config) {
      return NextResponse.json({ success: false, error: "Captação não encontrada" }, { status: 404 });
    }

    const captacao = JSON.parse(config.value);
    captacao.status = "recusado";
    captacao.recusadoEm = new Date().toISOString();
    captacao.recusadoPor = session.userId;

    await prisma.systemConfig.update({
      where: { key: config.key },
      data: { value: JSON.stringify(captacao) },
    });

    return NextResponse.json({ success: true, message: "Captação recusada" });
  } catch (error) {
    console.error("Negar captação error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
