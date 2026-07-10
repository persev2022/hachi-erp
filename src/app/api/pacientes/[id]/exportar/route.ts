import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

/**
 * GET: Export all patient data (LGPD — right of the data subject).
 * Returns a JSON with all personal data for the patient.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "COORDENADOR", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = session.tenantId;
    const { id } = await params;

    const paciente = await prisma.paciente.findUnique({
      where: { id, deletedAt: null },
      include: {
        responsaveis: true,
        evolucoes: {
          select: { tipo: true, createdAt: true, profissional: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        prescricoes: {
          select: { medicamento: true, dosagem: true, frequencia: true, ativa: true, createdAt: true },
        },
        agendamentos: {
          select: { tipo: true, dataHora: true, status: true, profissional: { select: { name: true } } },
          orderBy: { dataHora: "desc" },
        },
        movimentacoes: {
          select: { tipo: true, categoria: true, descricao: true, valor: true, status: true, dataVencimento: true },
          orderBy: { dataVencimento: "desc" },
        },
        comunicacoes: {
          select: { canal: true, mensagem: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    // Tenant isolation: verify patient belongs to tenant
    if (tenantId && paciente.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    await logAudit(session.userId, "LGPD_EXPORT", "Paciente", id, { action: "data_export" });

    const exportData = {
      _meta: {
        exportadoEm: new Date().toISOString(),
        exportadoPor: session.userId,
        motivo: "Exercício do direito do titular (LGPD Art. 18)",
      },
      dadosPessoais: {
        nome: paciente.nome,
        cpf: paciente.cpf,
        rg: paciente.rg,
        dataNascimento: paciente.dataNascimento,
        sexo: paciente.sexo,
        estadoCivil: paciente.estadoCivil,
        profissao: paciente.profissao,
        telefone: paciente.telefone,
        email: paciente.email,
      },
      endereco: {
        endereco: paciente.endereco,
        bairro: paciente.bairro,
        cidade: paciente.cidade,
        uf: paciente.uf,
        cep: paciente.cep,
      },
      tratamento: {
        status: paciente.status,
        dataAdmissao: paciente.dataAdmissao,
        dataAlta: paciente.dataAlta,
        diasTratamento: paciente.diasTratamento,
        substanciaPrincipal: paciente.substanciaPrincipal,
        tempoUso: paciente.tempoUso,
        internacoesPrevias: paciente.internacoesPrevias,
        comorbidades: paciente.comorbidades,
        alergias: paciente.alergias,
      },
      responsaveis: paciente.responsaveis.map((r) => ({
        nome: r.nome, cpf: r.cpf, parentesco: r.parentesco, telefone: r.telefone,
      })),
      evolucoes: paciente.evolucoes.map((e) => ({
        tipo: e.tipo, data: e.createdAt, profissional: e.profissional.name,
      })),
      prescricoes: paciente.prescricoes,
      agendamentos: paciente.agendamentos.map((a) => ({
        tipo: a.tipo, data: a.dataHora, status: a.status, profissional: a.profissional.name,
      })),
      financeiro: paciente.movimentacoes,
      comunicacoes: paciente.comunicacoes,
    };

    const fileName = `dados_paciente_${paciente.cpf}_${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("LGPD export error:", error);
    return NextResponse.json({ success: false, error: "Erro ao exportar" }, { status: 500 });
  }
}
