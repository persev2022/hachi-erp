import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// POST — Admin generates a public link for a form
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { tipo } = body; // "reserva-vaga" | "transporte-assistido"

    if (!["reserva-vaga", "transporte-assistido"].includes(tipo)) {
      return NextResponse.json({ success: false, error: "Tipo inválido. Use: reserva-vaga ou transporte-assistido" }, { status: 400 });
    }

    const token = crypto.randomBytes(16).toString("hex");

    await prisma.systemConfig.create({
      data: {
        key: `form_link_${token}`,
        value: JSON.stringify({
          token,
          tipo,
          tenantId: session.tenantId,
          criadoPor: session.userId,
          criadoEm: new Date().toISOString(),
          status: "pendente", // pendente | preenchido | assinado
          dados: null,
          assinatura: null,
        }),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hachi-erp.vercel.app";
    const link = `${baseUrl}/f/${token}`;

    return NextResponse.json({
      success: true,
      data: { token, link, tipo },
    });
  } catch (error) {
    console.error("Gerar link error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

// GET — Admin lists all generated form links
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { startsWith: "form_link_" } },
    });

    const links = configs
      .map((c) => { try { return JSON.parse(c.value); } catch { return null; } })
      .filter((l) => l && l.tenantId === session.tenantId)
      .sort((a: any, b: any) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return NextResponse.json({ success: true, data: links });
  } catch (error) {
    console.error("List links error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
