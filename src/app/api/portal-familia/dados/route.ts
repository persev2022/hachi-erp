import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("X-Family-Token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token não fornecido" },
        { status: 401 }
      );
    }

    // Clean token
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
            diasTratamento: true,
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

    const pacienteId = familyToken.paciente.id;
    
    // Calculate actual days in treatment
    const diasEmTratamento = Math.floor(
      (Date.now() - new Date(familyToken.paciente.dataAdmissao).getTime()) / 86400000
    );

    // Last 5 evolutions — summary only, NO clinical content
    const evolucoes = await prisma.evolucao.findMany({
      where: { pacienteId },
      select: {
        id: true,
        tipo: true,
        createdAt: true,
        profissional: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Next appointments
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        pacienteId,
        dataHora: { gte: new Date() },
        status: { in: ["AGENDADO", "CONFIRMADO"] },
      },
      select: {
        id: true,
        tipo: true,
        dataHora: true,
        profissional: {
          select: { name: true },
        },
      },
      orderBy: { dataHora: "asc" },
      take: 10,
    });

    // Financial status — counts only, NO values
    const [pendentes, pagos] = await Promise.all([
      prisma.movimentacaoFinanceira.count({
        where: { pacienteId, status: { in: ["PENDENTE", "ATRASADO"] } },
      }),
      prisma.movimentacaoFinanceira.count({
        where: { pacienteId, status: "PAGO" },
      }),
    ]);

    // Last communication
    const ultimaComunicacao = await prisma.comunicacao.findFirst({
      where: { pacienteId },
      select: {
        id: true,
        canal: true,
        assunto: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Update lastAccess
    await prisma.familyToken.update({
      where: { id: familyToken.id },
      data: { lastAccess: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        paciente: {
          nome: familyToken.paciente.nome,
          status: familyToken.paciente.status,
          dataAdmissao: familyToken.paciente.dataAdmissao,
          diasTratamento: diasEmTratamento,
        },
        evolucoes: evolucoes.map((e) => ({
          tipo: e.tipo,
          data: e.createdAt,
          profissional: e.profissional.name,
        })),
        agendamentos: agendamentos.map((a) => ({
          tipo: a.tipo,
          dataHora: a.dataHora,
          profissional: a.profissional.name,
        })),
        financeiro: {
          pendentes,
          pagos,
        },
        ultimaComunicacao: ultimaComunicacao
          ? {
              canal: ultimaComunicacao.canal,
              assunto: ultimaComunicacao.assunto,
              status: ultimaComunicacao.status,
              data: ultimaComunicacao.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Family data error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
