import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Token é obrigatório" },
        { status: 400 }
      );
    }

    // Clean token — remove dashes and spaces (user may paste formatted version)
    const cleanToken = token.replace(/[-\s]/g, "");

    const familyToken = await prisma.familyToken.findUnique({
      where: { token: cleanToken },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            status: true,
            dataAdmissao: true,
          },
        },
      },
    });

    if (!familyToken || !familyToken.active) {
      return NextResponse.json(
        { success: false, error: "Token inválido ou desativado" },
        { status: 401 }
      );
    }

    // Update lastAccess
    await prisma.familyToken.update({
      where: { id: familyToken.id },
      data: { lastAccess: new Date() },
    });

    return NextResponse.json({
      success: true,
      paciente: {
        nome: familyToken.paciente.nome,
        status: familyToken.paciente.status,
      },
      familiarNome: familyToken.familiarNome,
    });
  } catch (error) {
    console.error("Family auth error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
