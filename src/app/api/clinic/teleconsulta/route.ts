import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/services/audit";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    // List teleconsulta sessions for this tenant
    const configs = await prisma.systemConfig.findMany({
      where: { key: { startsWith: `teleconsulta_${session.tenantId}_` } },
    });

    const sessions = configs
      .map((c) => { try { return JSON.parse(c.value); } catch { return null; } })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("Teleconsulta GET error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { pacienteId, profissionalNome, dataHora, duracao, notas } = body;

    if (!pacienteId) {
      return NextResponse.json({ success: false, error: "pacienteId obrigatório" }, { status: 400 });
    }

    // Generate unique room ID for video call
    const roomId = crypto.randomBytes(8).toString("hex");
    const meetingLink = `https://meet.hachi.com.br/${roomId}`;
    const id = crypto.randomUUID();

    await prisma.systemConfig.create({
      data: {
        key: `teleconsulta_${session.tenantId}_${id}`,
        value: JSON.stringify({
          id,
          roomId,
          meetingLink,
          pacienteId,
          profissionalNome: profissionalNome || "Profissional",
          profissionalId: session.userId,
          dataHora: dataHora || new Date().toISOString(),
          duracao: duracao || 30,
          status: "agendada",
          notas: notas || "",
          gravacao: null,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    await logAudit(session.userId, "CREATE", "Teleconsulta", id, { pacienteId, roomId });

    return NextResponse.json({
      success: true,
      data: {
        id,
        roomId,
        meetingLink,
        status: "agendada",
      },
    });
  } catch (error) {
    console.error("Teleconsulta POST error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
