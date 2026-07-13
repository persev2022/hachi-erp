import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Diário de Classe — Registro de frequência/presença
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const turma = searchParams.get("turma") || "";
  const data = searchParams.get("data") || new Date().toISOString().split("T")[0];

  try {
    const configKey = `diario_${session.tenantId}_${turma}_${data}`;
    const existing = await prisma.systemConfig.findFirst({ where: { key: configKey } });

    if (existing) {
      return NextResponse.json({ success: true, data: JSON.parse(existing.value) });
    }

    // Get students (pacientes) for this tenant as class roster
    const alunos = await prisma.paciente.findMany({
      where: { tenantId: session.tenantId!, status: "ATIVO" },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    });

    const roster = alunos.map((a) => ({
      alunoId: a.id,
      alunoNome: a.nome,
      presente: null as boolean | null, // null = not yet marked
    }));

    return NextResponse.json({
      success: true,
      data: { turma, data, registros: roster, salvo: false },
    });
  } catch (error) {
    console.error("Diário GET error:", error);
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
    const { turma, data, registros, observacoes } = body;

    if (!turma || !data || !registros) {
      return NextResponse.json({ success: false, error: "turma, data e registros são obrigatórios" }, { status: 400 });
    }

    const configKey = `diario_${session.tenantId}_${turma}_${data}`;

    const payload = {
      turma,
      data,
      registros, // Array of { alunoId, alunoNome, presente: boolean }
      observacoes: observacoes || "",
      professorId: session.userId,
      salvoEm: new Date().toISOString(),
      salvo: true,
      totalPresentes: registros.filter((r: any) => r.presente === true).length,
      totalAusentes: registros.filter((r: any) => r.presente === false).length,
    };

    await prisma.systemConfig.upsert({
      where: { key: configKey },
      create: { key: configKey, value: JSON.stringify(payload) },
      update: { value: JSON.stringify(payload) },
    });

    return NextResponse.json({
      success: true,
      data: { presentes: payload.totalPresentes, ausentes: payload.totalAusentes },
    });
  } catch (error) {
    console.error("Diário POST error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
