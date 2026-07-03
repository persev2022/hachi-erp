import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
  }

  const config = await prisma.systemConfig.findUnique({ where: { key: "clinica" } });
  if (!config) return NextResponse.json({ success: true, data: null });

  try {
    return NextResponse.json({ success: true, data: JSON.parse(config.value) });
  } catch {
    return NextResponse.json({ success: true, data: null });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await req.json();

    await prisma.systemConfig.upsert({
      where: { key: "clinica" },
      update: { value: JSON.stringify(body) },
      create: { key: "clinica", value: JSON.stringify(body) },
    });

    return NextResponse.json({ success: true, message: "Dados salvos" });
  } catch (error) {
    console.error("PUT /api/configuracoes/clinica error:", error);
    return NextResponse.json({ success: false, error: "Erro ao salvar" }, { status: 500 });
  }
}
