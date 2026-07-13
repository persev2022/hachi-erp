import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { startsWith: `matricula_${session.tenantId}_` } },
    });

    const matriculas = configs
      .map((c) => { try { return JSON.parse(c.value); } catch { return null; } })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: matriculas });
  } catch (error) {
    console.error("Matrícula GET error:", error);
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
    const { alunoNome, turma, serie, periodo, responsavel, responsavelTel, documentosEntregues } = body;

    if (!alunoNome || !turma) {
      return NextResponse.json({ success: false, error: "Nome do aluno e turma são obrigatórios" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await prisma.systemConfig.create({
      data: {
        key: `matricula_${session.tenantId}_${id}`,
        value: JSON.stringify({
          id,
          alunoNome,
          turma,
          serie: serie || "",
          periodo: periodo || "2026",
          responsavel: responsavel || "",
          responsavelTel: responsavelTel || "",
          status: "confirmada",
          documentosEntregues: documentosEntregues || [],
          dataMatricula: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id, alunoNome, turma, status: "confirmada" },
    });
  } catch (error) {
    console.error("Matrícula POST error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
