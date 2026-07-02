import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { generateDocx } from "@/lib/documents/generator";
import { toTitleCase, toSlug, dataParaExtenso } from "@/lib/documents/format";

/**
 * POST: Generate LGPD consent term for a patient.
 * Records consent acceptance in audit log.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { pacienteId, aceite } = body;

    if (!pacienteId) {
      return NextResponse.json({ success: false, error: "pacienteId obrigatório" }, { status: 400 });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, deletedAt: null },
      include: { responsaveis: { where: { isFinanceiro: true }, take: 1 } },
    });

    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    // Record consent in audit log
    if (aceite) {
      await logAudit(session.userId, "LGPD_CONSENT", "Paciente", pacienteId, {
        aceite: true,
        dataAceite: new Date().toISOString(),
        ip: req.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: "Consentimento LGPD registrado com sucesso",
        data: { pacienteId, aceite: true, registradoEm: new Date().toISOString() },
      });
    }

    // Generate consent document
    const responsavel = paciente.responsaveis[0];
    const docBuffer = generateDocx("CONTRATO", {
      data_entrada: new Date().toLocaleDateString("pt-BR"),
      nome_paciente: toTitleCase(paciente.nome),
      cpf_paciente: paciente.cpf,
      nasc_paciente: paciente.dataNascimento.toLocaleDateString("pt-BR"),
      profissao_paciente: paciente.profissao || "",
      estado_civil_paciente: paciente.estadoCivil.toLowerCase(),
      endereco_rua: paciente.endereco || "",
      bairro: paciente.bairro || "",
      cidade: paciente.cidade || "",
      uf: paciente.uf || "",
      cep: paciente.cep || "",
      nome_familiar: responsavel ? toTitleCase(responsavel.nome) : "",
      cpf_familiar: responsavel?.cpf || "",
      nasc_familiar: "",
      profissao_familiar: "",
      estado_civil_familiar: "",
      parentesco: responsavel?.parentesco || "",
      telefone: responsavel?.telefone || paciente.telefone || "",
      dias_tratamento: String(paciente.diasTratamento),
      matricula: "",
      mensalidade: "",
      vencimento: "",
      total: "",
    });

    const fileName = `termo-lgpd-${toSlug(paciente.nome)}.docx`;

    return new NextResponse(new Uint8Array(docBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("POST /api/documentos/lgpd error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
