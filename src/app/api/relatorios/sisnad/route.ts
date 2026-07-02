import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

/**
 * GET: SISNAD (Sistema Nacional de Políticas Públicas sobre Drogas) report data.
 * Exports patient data in the format required by Brazilian drug policy authorities.
 * Fields: nome, sexo, idade, substância, tempo de uso, internações prévias, status.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Apenas ADMIN pode exportar dados SISNAD" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const ano = parseInt(searchParams.get("ano") || String(new Date().getFullYear()));

    const startOfYear = new Date(ano, 0, 1);
    const endOfYear = new Date(ano, 11, 31, 23, 59, 59);

    // Get all patients admitted in the year
    const pacientes = await prisma.paciente.findMany({
      where: {
        dataAdmissao: { gte: startOfYear, lte: endOfYear },
        deletedAt: null,
      },
      select: {
        nome: true,
        sexo: true,
        dataNascimento: true,
        substanciaPrincipal: true,
        tempoUso: true,
        internacoesPrevias: true,
        status: true,
        dataAdmissao: true,
        dataAlta: true,
        diasTratamento: true,
        cidade: true,
        uf: true,
      },
      orderBy: { dataAdmissao: "asc" },
    });

    const now = new Date();

    const dados = pacientes.map((p) => {
      const idade = Math.floor(
        (now.getTime() - new Date(p.dataNascimento).getTime()) / (365.25 * 86400000)
      );
      return {
        nome: p.nome,
        sexo: p.sexo === "M" ? "Masculino" : "Feminino",
        idade,
        faixaEtaria: idade < 18 ? "Menor" : idade <= 25 ? "18-25" : idade <= 35 ? "26-35" : idade <= 45 ? "36-45" : "46+",
        substanciaPrincipal: p.substanciaPrincipal || "Não informado",
        tempoUso: p.tempoUso || "Não informado",
        internacoesPrevias: p.internacoesPrevias,
        status: p.status,
        dataAdmissao: p.dataAdmissao.toLocaleDateString("pt-BR"),
        dataAlta: p.dataAlta ? p.dataAlta.toLocaleDateString("pt-BR") : null,
        diasTratamento: p.diasTratamento,
        cidade: p.cidade || "—",
        uf: p.uf || "—",
      };
    });

    // Summary statistics
    const resumo = {
      totalAdmissoes: dados.length,
      porSexo: {
        masculino: dados.filter((d) => d.sexo === "Masculino").length,
        feminino: dados.filter((d) => d.sexo === "Feminino").length,
      },
      porFaixaEtaria: {
        menor18: dados.filter((d) => d.faixaEtaria === "Menor").length,
        de18a25: dados.filter((d) => d.faixaEtaria === "18-25").length,
        de26a35: dados.filter((d) => d.faixaEtaria === "26-35").length,
        de36a45: dados.filter((d) => d.faixaEtaria === "36-45").length,
        acima46: dados.filter((d) => d.faixaEtaria === "46+").length,
      },
      porSubstancia: Object.entries(
        dados.reduce((acc, d) => {
          acc[d.substanciaPrincipal] = (acc[d.substanciaPrincipal] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1]),
      porStatus: {
        ativos: dados.filter((d) => d.status === "ATIVO").length,
        alta: dados.filter((d) => d.status === "ALTA").length,
        evadidos: dados.filter((d) => d.status === "EVADIDO").length,
        transferidos: dados.filter((d) => d.status === "TRANSFERIDO").length,
      },
      permanenciaMedia: dados.length > 0
        ? Math.round(dados.reduce((s, d) => s + d.diasTratamento, 0) / dados.length)
        : 0,
    };

    await logAudit(session.userId, "EXPORT", "SISNAD", undefined, { ano });

    return NextResponse.json({
      success: true,
      data: { ano, resumo, pacientes: dados },
    });
  } catch (error) {
    console.error("GET /api/relatorios/sisnad error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar relatório SISNAD" }, { status: 500 });
  }
}
