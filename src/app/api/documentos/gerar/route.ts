import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { generateDocx, TemplateType } from "@/lib/documents/generator";
import {
  toTitleCase,
  toSlug,
  formatDateBR,
  dataParaExtenso,
  diasParaMeses,
  somarMeses,
  calcularPrimeiroVencimento,
} from "@/lib/documents/format";
import { formatarValorContrato, formatarValor } from "@/lib/documents/valor";

const gerarDocumentoSchema = z.object({
  tipo: z.enum(["CONTRATO", "RECIBO", "RECEITA_SIMPLES", "RECEITA_ESPECIAL", "ATESTADO"]),
  pacienteId: z.string().uuid("ID do paciente inválido"),
  // Extra fields depending on document type
  motivo: z.string().optional(), // for RECIBO
  valor: z.number().optional(), // for RECIBO
  nomePagante: z.string().optional(), // for RECIBO
  cpfPagante: z.string().optional(), // for RECIBO
  descricao: z.string().optional(), // for RECEITA_ESPECIAL
  dataInicio: z.string().optional(), // for ATESTADO
  dataFim: z.string().optional(), // for ATESTADO
});

// POST: Generate document
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = gerarDocumentoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { tipo, pacienteId } = parsed.data;

    // Get patient with responsavel
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId, deletedAt: null },
      include: {
        responsaveis: { where: { isFinanceiro: true }, take: 1 },
        quarto: { select: { numero: true } },
      },
    });

    if (!paciente) {
      return NextResponse.json(
        { success: false, error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const responsavel = paciente.responsaveis[0];
    let docBuffer: Buffer;
    let fileName: string;

    switch (tipo) {
      case "CONTRATO": {
        const dataEntrada = paciente.dataAdmissao;
        const meses = diasParaMeses(paciente.diasTratamento);
        const dataFimCalc = somarMeses(dataEntrada, meses);
        const matriculaFmt = formatarValorContrato(paciente.matriculaValor || 0);
        const mensalidadeFmt = formatarValorContrato(paciente.mensalidadeValor || 0);
        const totalNum = (paciente.matriculaValor || 0) + (paciente.mensalidadeValor || 0) * meses;
        const totalFmt = formatarValorContrato(totalNum);
        const primeiroVencimento = calcularPrimeiroVencimento(
          dataEntrada,
          paciente.diaVencimento || 5
        );

        docBuffer = generateDocx("CONTRATO", {
          data_entrada: formatDateBR(dataEntrada),
          nome_paciente: toTitleCase(paciente.nome),
          cpf_paciente: paciente.cpf,
          nasc_paciente: formatDateBR(paciente.dataNascimento),
          profissao_paciente: paciente.profissao || "",
          estado_civil_paciente: paciente.estadoCivil.toLowerCase(),
          endereco_rua: paciente.endereco || "",
          bairro: paciente.bairro || "",
          cidade: paciente.cidade || "",
          uf: paciente.uf || "",
          cep: paciente.cep || "",
          nome_familiar: responsavel ? toTitleCase(responsavel.nome) : "",
          cpf_familiar: responsavel?.cpf || "",
          nasc_familiar: responsavel?.dataNascimento ? formatDateBR(responsavel.dataNascimento) : "",
          profissao_familiar: responsavel?.profissao || "",
          estado_civil_familiar: responsavel?.estadoCivil?.toLowerCase() || "",
          parentesco: responsavel?.parentesco || "",
          telefone: responsavel?.telefone || paciente.telefone || "",
          dias_tratamento: String(paciente.diasTratamento),
          matricula: matriculaFmt,
          mensalidade: mensalidadeFmt,
          vencimento: formatDateBR(primeiroVencimento),
          total: totalFmt,
        });
        fileName = `contrato-${toSlug(paciente.nome)}.docx`;
        break;
      }

      case "RECIBO": {
        const pagante = parsed.data.nomePagante || responsavel?.nome || paciente.nome;
        const cpfPagante = parsed.data.cpfPagante || responsavel?.cpf || paciente.cpf;
        const valor = parsed.data.valor || paciente.matriculaValor || 0;
        const { valorNum, valorExtenso } = formatarValor(valor);
        const motivo = parsed.data.motivo || "Matrícula";

        docBuffer = generateDocx("RECIBO", {
          nome_pagante: toTitleCase(pagante),
          cpf_pagante: cpfPagante,
          valor_num: valorNum,
          valor_extenso: valorExtenso,
          motivo,
          data_atual: dataParaExtenso(new Date()),
        });
        fileName = `recibo-${toSlug(pagante)}-${toSlug(motivo)}.docx`;
        break;
      }

      case "RECEITA_SIMPLES": {
        docBuffer = generateDocx("RECEITA_SIMPLES", {
          nome_completo: toTitleCase(paciente.nome),
          nome_completo_slug: toSlug(paciente.nome),
          endereco: paciente.endereco || "",
          data_atual: new Date().toLocaleDateString("pt-BR"),
        });
        fileName = `receituario-simples-${toSlug(paciente.nome)}.docx`;
        break;
      }

      case "RECEITA_ESPECIAL": {
        docBuffer = generateDocx("RECEITA_ESPECIAL", {
          nome_completo: toTitleCase(paciente.nome),
          nome_completo_slug: toSlug(paciente.nome),
          endereco: paciente.endereco || "",
          cpf: paciente.cpf,
          cidade: paciente.cidade || "",
          uf: paciente.uf || "",
          telefone: paciente.telefone || "",
          descricao: parsed.data.descricao || "",
          data_atual: new Date().toLocaleDateString("pt-BR"),
        });
        fileName = `receituario-especial-${toSlug(paciente.nome)}.docx`;
        break;
      }

      case "ATESTADO": {
        const dataInicio = parsed.data.dataInicio
          ? dataParaExtenso(new Date(parsed.data.dataInicio))
          : dataParaExtenso(paciente.dataAdmissao);
        const dataFim = parsed.data.dataFim
          ? dataParaExtenso(new Date(parsed.data.dataFim))
          : dataParaExtenso(
              paciente.dataAltaPrevista || somarMeses(paciente.dataAdmissao, diasParaMeses(paciente.diasTratamento))
            );

        docBuffer = generateDocx("ATESTADO", {
          nome_completo: toTitleCase(paciente.nome),
          cpf: paciente.cpf,
          data_inicio: dataInicio,
          data_fim: dataFim,
          data_atual: dataParaExtenso(new Date()),
        });
        fileName = `atestado-${toSlug(paciente.nome)}.docx`;
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Tipo de documento não suportado" },
          { status: 400 }
        );
    }

    // Log audit
    await logAudit(session.userId, "GENERATE", "Documento", pacienteId, {
      tipo,
      fileName,
    });

    // Return the docx file as download
    return new NextResponse(new Uint8Array(docBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("POST /api/documentos/gerar error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao gerar documento" },
      { status: 500 }
    );
  }
}
