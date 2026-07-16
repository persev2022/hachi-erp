import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

// Zod schema for creating a patient
const createPacienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  rg: z.string().optional(),
  dataNascimento: z.string().transform((s) => new Date(s)),
  sexo: z.string().min(1, "Sexo é obrigatório"),
  estadoCivil: z.enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL"]),
  profissao: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),

  // Endereço
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  cep: z.string().optional(),

  // Clínico
  substanciaPrincipal: z.string().optional(),
  tempoUso: z.string().optional(),
  internacoesPrevias: z.number().int().min(0).default(0),
  comorbidades: z.string().optional(),
  alergias: z.string().optional(),

  // Tratamento
  dataAdmissao: z.string().transform((s) => new Date(s)),
  dataAltaPrevista: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  diasTratamento: z.number().int().min(1, "Dias de tratamento deve ser pelo menos 1"),
  quartoId: z.string().uuid().optional(),

  // Financeiro
  matriculaValor: z.number().optional(),
  mensalidadeValor: z.number().optional(),
  diaVencimento: z.number().int().optional(),

  // Responsável
  responsavel: z
    .object({
      nome: z.string().min(2),
      cpf: z.string().min(11),
      dataNascimento: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
      profissao: z.string().optional(),
      estadoCivil: z.enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL"]).optional(),
      parentesco: z.string().min(1),
      telefone: z.string().min(8),
      email: z.string().email().optional().or(z.literal("")),
      endereco: z.string().optional(),
      isFinanceiro: z.boolean().default(true),
    })
    .optional(),
});

// GET: List patients with search, filter, pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    // Build where clause (tenant-scoped)
    const where: any = {
      deletedAt: null,
    };

    // CRITICAL: Always filter by tenant. If no tenantId, return empty.
    if (session.tenantId) {
      where.tenantId = session.tenantId;
    } else {
      // User without tenant should see nothing
      return NextResponse.json({ success: true, data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } });
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.paciente.count({ where });

    // Get paginated results
    const pacientes = await prisma.paciente.findMany({
      where,
      include: {
        quarto: { select: { numero: true } },
        responsaveis: { select: { nome: true, parentesco: true, telefone: true } },
      },
      orderBy: { nome: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      data: pacientes,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/pacientes error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar pacientes" },
      { status: 500 }
    );
  }
}

// POST: Create a new patient
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
    const parsed = createPacienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { responsavel, ...pacienteData } = parsed.data;

    // Create patient + responsável in transaction
    const paciente = await prisma.$transaction(async (tx) => {
      const newPaciente = await tx.paciente.create({
        data: {
          ...pacienteData,
          email: pacienteData.email || null,
          ...(session.tenantId ? { tenantId: session.tenantId } : {}),
        },
      });

      if (responsavel) {
        await tx.responsavel.create({
          data: {
            pacienteId: newPaciente.id,
            ...responsavel,
            email: responsavel.email || null,
          },
        });
      }

      return tx.paciente.findUnique({
        where: { id: newPaciente.id },
        include: {
          responsaveis: true,
          quarto: { select: { numero: true } },
        },
      });
    });

    // Audit log
    await logAudit(session.userId, "CREATE", "Paciente", paciente?.id, {
      nome: pacienteData.nome,
      cpf: pacienteData.cpf,
    });

    // Auto-generate contract document (if responsavel exists)
    if (paciente && responsavel) {
      try {
        const { generateDocx } = await import("@/lib/documents/generator");
        const { signDocument } = await import("@/lib/documents/signature");
        const { formatDateBR, diasParaMeses, somarMeses, calcularPrimeiroVencimento } = await import("@/lib/documents/format");
        const { toTitleCase, toSlug } = await import("@/lib/documents/format");
        const { formatarValorContrato } = await import("@/lib/documents/valor");

        const dataEntrada = new Date(pacienteData.dataAdmissao);
        const meses = diasParaMeses(pacienteData.diasTratamento);
        const matriculaFmt = formatarValorContrato(pacienteData.matriculaValor || 0);
        const mensalidadeFmt = formatarValorContrato(pacienteData.mensalidadeValor || 0);
        const totalNum = (pacienteData.matriculaValor || 0) + (pacienteData.mensalidadeValor || 0) * meses;
        const primeiroVencimento = calcularPrimeiroVencimento(dataEntrada, pacienteData.diaVencimento || 5);

        const docBuffer = generateDocx("CONTRATO", {
          data_entrada: formatDateBR(dataEntrada),
          nome_paciente: toTitleCase(pacienteData.nome),
          cpf_paciente: pacienteData.cpf,
          nasc_paciente: formatDateBR(new Date(pacienteData.dataNascimento)),
          profissao_paciente: pacienteData.profissao || "",
          estado_civil_paciente: pacienteData.estadoCivil.toLowerCase(),
          endereco_rua: pacienteData.endereco || "",
          bairro: pacienteData.bairro || "",
          cidade: pacienteData.cidade || "",
          uf: pacienteData.uf || "",
          cep: pacienteData.cep || "",
          nome_familiar: toTitleCase(responsavel.nome),
          cpf_familiar: responsavel.cpf,
          parentesco: responsavel.parentesco,
          telefone: responsavel.telefone || "",
          dias_tratamento: String(pacienteData.diasTratamento),
          matricula: matriculaFmt,
          mensalidade: mensalidadeFmt,
          vencimento: formatDateBR(primeiroVencimento),
          total: formatarValorContrato(totalNum),
        });

        // Sign the document
        const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true, cpf: true, role: true } });
        const signature = signDocument(
          docBuffer,
          { userId: session.userId, name: user?.name || "", cpf: user?.cpf || undefined, email: user?.email || "", role: user?.role || "", tenantId: session.tenantId || undefined },
          { type: "CONTRATO", title: `Contrato - ${pacienteData.nome}` }
        );

        // Save document record
        await prisma.documento.create({
          data: {
            pacienteId: paciente.id,
            tipo: "CONTRATO",
            titulo: `Contrato - ${pacienteData.nome}`,
            arquivo: JSON.stringify({ signatureId: signature.id, signatureHash: signature.hash, signedAt: signature.signedAt }),
            formato: "docx",
            geradoPor: session.userId,
            assinado: true,
          },
        });
      } catch (contractError) {
        // Don't fail patient creation if contract generation fails
        console.error("Auto-contract generation failed:", contractError);
      }
    }

    return NextResponse.json(
      { success: true, data: paciente },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/pacientes error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "CPF já cadastrado" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao criar paciente" },
      { status: 500 }
    );
  }
}
