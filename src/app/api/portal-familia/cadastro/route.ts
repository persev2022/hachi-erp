import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * POST: Self-registration for family members.
 * Creates a responsavel record + family token.
 * Public endpoint (no auth required).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pacienteId, nome, parentesco, telefone, email, cpf } = body;

    if (!pacienteId || !nome || !parentesco || !telefone) {
      return NextResponse.json(
        { success: false, error: "Preencha todos os campos obrigatórios" },
        { status: 400 }
      );
    }

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, status: "ATIVO", deletedAt: null },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Create responsavel record
    await prisma.responsavel.create({
      data: {
        pacienteId,
        nome,
        cpf: cpf || "00000000000",
        parentesco,
        telefone,
        email: email || null,
        isFinanceiro: true,
      },
    });

    // Generate family token
    const token = randomBytes(16).toString("hex");

    await prisma.familyToken.create({
      data: {
        token,
        pacienteId,
        familiarNome: nome,
        familiarPhone: telefone,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      message: "Cadastro realizado com sucesso",
    });
  } catch (error) {
    console.error("POST /api/portal-familia/cadastro error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao cadastrar" },
      { status: 500 }
    );
  }
}
