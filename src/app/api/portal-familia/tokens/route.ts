import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || !["ADMIN", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const tokens = await prisma.familyToken.findMany({
      include: {
        paciente: {
          select: { id: true, nome: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error("Error listing family tokens:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || !["ADMIN", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { pacienteId, familiarNome, familiarPhone } = body;

    if (!pacienteId || !familiarNome) {
      return NextResponse.json(
        { success: false, error: "pacienteId e familiarNome são obrigatórios" },
        { status: 400 }
      );
    }

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Generate a random 32-char hex token
    const token = randomBytes(16).toString("hex");

    const familyToken = await prisma.familyToken.create({
      data: {
        token,
        pacienteId,
        familiarNome,
        familiarPhone: familiarPhone || null,
      },
      include: {
        paciente: {
          select: { nome: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      familyToken: {
        id: familyToken.id,
        token: familyToken.token,
        familiarNome: familyToken.familiarNome,
        pacienteNome: familyToken.paciente.nome,
        createdAt: familyToken.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating family token:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || !["ADMIN", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, active } = body;

    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        { success: false, error: "id e active são obrigatórios" },
        { status: 400 }
      );
    }

    const updated = await prisma.familyToken.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({ success: true, token: updated });
  } catch (error) {
    console.error("Error updating family token:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
