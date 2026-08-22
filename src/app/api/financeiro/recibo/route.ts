import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/financeiro/recibo?id=<movimentacaoId>
 * Generates a printable receipt for a paid movimentação.
 * Returns structured data that the frontend can render as a receipt.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const movId = searchParams.get("id");
    if (!movId) return NextResponse.json({ success: false, error: "ID obrigatório" }, { status: 400 });

    const mov = await prisma.movimentacaoFinanceira.findUnique({
      where: { id: movId },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            responsaveis: { where: { isFinanceiro: true }, take: 1 },
          },
        },
      },
    });

    if (!mov) return NextResponse.json({ success: false, error: "Movimentação não encontrada" }, { status: 404 });
    if (session.tenantId && mov.tenantId !== session.tenantId) {
      return NextResponse.json({ success: false, error: "Não encontrado" }, { status: 404 });
    }

    if (mov.status !== "PAGO") {
      return NextResponse.json({ success: false, error: "Recibo só pode ser gerado para pagamentos confirmados" }, { status: 400 });
    }

    // Get tenant info for header
    const tenant = session.tenantId
      ? await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { name: true, slug: true } })
      : null;

    const responsavel = mov.paciente?.responsaveis?.[0] || null;

    const recibo = {
      numero: `REC-${mov.createdAt.getFullYear()}${String(mov.createdAt.getMonth() + 1).padStart(2, "0")}-${mov.id.slice(0, 6).toUpperCase()}`,
      empresa: tenant?.name || "Hachi ERP",
      data: mov.dataPagamento?.toISOString() || mov.updatedAt.toISOString(),
      paciente: mov.paciente?.nome || "—",
      cpfPaciente: mov.paciente?.cpf || "—",
      responsavel: responsavel?.nome || null,
      cpfResponsavel: responsavel?.cpf || null,
      descricao: mov.descricao,
      categoria: mov.categoria,
      valor: mov.valor,
      formaPagamento: mov.formaPagamento || "Não informado",
      observacoes: mov.observacoes,
      valorExtenso: valorPorExtenso(mov.valor),
    };

    return NextResponse.json({ success: true, data: recibo });
  } catch (error) {
    console.error("GET /api/financeiro/recibo error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar recibo" }, { status: 500 });
  }
}

function valorPorExtenso(valor: number): string {
  try {
    // Simple BRL formatting
    const inteiro = Math.floor(valor);
    const centavos = Math.round((valor - inteiro) * 100);
    const reais = inteiro === 1 ? "real" : "reais";
    if (centavos === 0) return `${inteiro} ${reais}`;
    return `${inteiro} ${reais} e ${centavos} centavo${centavos > 1 ? "s" : ""}`;
  } catch {
    return "";
  }
}
