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
            dataAltaPrevista: true,
            diasTratamento: true,
            substanciaPrincipal: true,
            quarto: { select: { numero: true } },
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
    const diasEmTratamento = Math.max(1, Math.floor(
      (Date.now() - new Date(familyToken.paciente.dataAdmissao).getTime()) / 86400000
    ));

    // Progress percentage
    const progressoPercentual = Math.min(100, Math.round(
      (diasEmTratamento / familyToken.paciente.diasTratamento) * 100
    ));

    // Last 10 evolutions — tipo, date, profissional (NO clinical content)
    const evolucoes = await prisma.evolucao.findMany({
      where: { pacienteId },
      select: {
        id: true,
        tipo: true,
        createdAt: true,
        assinado: true,
        profissional: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Evolution frequency by type (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const evolucoesMes = await prisma.evolucao.groupBy({
      by: ["tipo"],
      where: { pacienteId, createdAt: { gte: thirtyDaysAgo } },
      _count: true,
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
        duracao: true,
        status: true,
        sala: true,
        profissional: { select: { name: true, role: true } },
      },
      orderBy: { dataHora: "asc" },
      take: 10,
    });

    // Past appointments (last 10)
    const agendamentosPassados = await prisma.agendamento.findMany({
      where: {
        pacienteId,
        status: "CONCLUIDO",
      },
      select: {
        tipo: true,
        dataHora: true,
        profissional: { select: { name: true } },
      },
      orderBy: { dataHora: "desc" },
      take: 10,
    });

    // Financial — counts and totals by status (NO individual values)
    const [pendentes, pagos, atrasados] = await Promise.all([
      prisma.movimentacaoFinanceira.count({
        where: { pacienteId, tipo: "RECEITA", status: "PENDENTE" },
      }),
      prisma.movimentacaoFinanceira.count({
        where: { pacienteId, tipo: "RECEITA", status: "PAGO" },
      }),
      prisma.movimentacaoFinanceira.count({
        where: { pacienteId, tipo: "RECEITA", status: "ATRASADO" },
      }),
    ]);

    // Last 5 communications
    const comunicacoes = await prisma.comunicacao.findMany({
      where: { pacienteId },
      select: {
        id: true,
        canal: true,
        assunto: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Active prescriptions count (NOT details — privacy)
    const prescricoesAtivas = await prisma.prescricao.count({
      where: { pacienteId, ativa: true },
    });

    // Weekly activity summary (evolutions per day this week)
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const atividadeSemana = await prisma.evolucao.groupBy({
      by: ["tipo"],
      where: { pacienteId, createdAt: { gte: weekAgo } },
      _count: true,
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
          dataAltaPrevista: familyToken.paciente.dataAltaPrevista,
          diasTratamento: familyToken.paciente.diasTratamento,
          diasEmTratamento,
          progressoPercentual,
          substanciaPrincipal: familyToken.paciente.substanciaPrincipal,
          quarto: familyToken.paciente.quarto?.numero || null,
        },
        familiarNome: familyToken.familiarNome,
        evolucoes: evolucoes.map((e) => ({
          tipo: e.tipo,
          data: e.createdAt,
          profissional: e.profissional.name,
          role: e.profissional.role,
          assinado: e.assinado,
        })),
        evolucoesMes: evolucoesMes.map((e) => ({
          tipo: e.tipo,
          quantidade: e._count,
        })),
        atividadeSemana: atividadeSemana.map((a) => ({
          tipo: a.tipo,
          quantidade: a._count,
        })),
        agendamentos: agendamentos.map((a) => ({
          tipo: a.tipo,
          dataHora: a.dataHora,
          duracao: a.duracao,
          status: a.status,
          sala: a.sala,
          profissional: a.profissional.name,
          role: a.profissional.role,
        })),
        agendamentosPassados: agendamentosPassados.map((a) => ({
          tipo: a.tipo,
          dataHora: a.dataHora,
          profissional: a.profissional.name,
        })),
        financeiro: {
          pendentes,
          pagos,
          atrasados,
          total: pendentes + pagos + atrasados,
        },
        comunicacoes: comunicacoes.map((c) => ({
          canal: c.canal,
          assunto: c.assunto,
          status: c.status,
          data: c.createdAt,
        })),
        prescricoesAtivas,
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
