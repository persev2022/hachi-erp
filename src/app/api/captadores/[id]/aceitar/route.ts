import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/services/audit";

// POST — Admin aceita captação e cadastra paciente automaticamente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  if (session.role !== "ADMIN" && session.role !== "COORDENADOR") {
    return NextResponse.json({ success: false, error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const configKey = `captacao_${session.tenantId}_${id}`;

    const config = await prisma.systemConfig.findFirst({ where: { key: configKey } });
    if (!config) {
      return NextResponse.json({ success: false, error: "Captação não encontrada" }, { status: 404 });
    }

    const captacao = JSON.parse(config.value);

    if (captacao.status === "aceito") {
      return NextResponse.json({ success: false, error: "Captação já foi aceita" }, { status: 400 });
    }

    const dados = captacao.dados;

    // Map estado civil from form to enum
    const estadoCivilMap: Record<string, string> = {
      "Solteiro(a)": "SOLTEIRO", "Casado(a)": "CASADO", "Divorciado(a)": "DIVORCIADO",
      "Viúvo(a)": "VIUVO", "União Estável": "UNIAO_ESTAVEL",
    };
    const estadoCivil = (estadoCivilMap[dados.pacienteEstadoCivil] || "SOLTEIRO") as "SOLTEIRO" | "CASADO" | "DIVORCIADO" | "VIUVO" | "UNIAO_ESTAVEL";

    // Create patient automatically
    const paciente = await prisma.paciente.create({
      data: {
        tenantId: session.tenantId!,
        nome: dados.pacienteNome,
        cpf: dados.pacienteCpf || `TEMP-${Date.now()}`,
        dataNascimento: dados.pacienteNascimento ? new Date(dados.pacienteNascimento) : new Date("1990-01-01"),
        sexo: dados.pacienteSexo === "Feminino" ? "F" : "M",
        estadoCivil,
        telefone: dados.pacienteTelefone || "",
        email: dados.pacienteEmail || "",
        endereco: dados.pacienteEndereco || "",
        profissao: dados.pacienteProfissao || "",
        dataAdmissao: new Date(),
        diasTratamento: parseInt(dados.planoTratamento?.replace(/\D/g, "") || "90") * 30,
        mensalidadeValor: parseFloat(dados.valorMensalidade?.replace(/\D/g, "") || "0") || 0,
        status: "ATIVO",
      },
    });

    // Create responsavel record if provided
    if (dados.responsavelNome) {
      await prisma.responsavel.create({
        data: {
          pacienteId: paciente.id,
          nome: dados.responsavelNome,
          cpf: dados.responsavelCpf || "",
          telefone: dados.responsavelTelefone || "",
          parentesco: dados.responsavelParentesco || "",
          email: dados.responsavelEmail || "",
        },
      });
    }

    // Update captacao status
    captacao.status = "aceito";
    captacao.aceitoEm = new Date().toISOString();
    captacao.aceitoPor = session.userId;
    captacao.pacienteId = paciente.id;

    await prisma.systemConfig.update({
      where: { key: config.key },
      data: { value: JSON.stringify(captacao) },
    });

    await logAudit(session.userId, "CREATE", "Paciente", paciente.id, {
      source: "captador",
      captacaoId: id,
      captadorNome: dados.captadorNome,
    });

    return NextResponse.json({
      success: true,
      data: { pacienteId: paciente.id, pacienteNome: paciente.nome },
    });
  } catch (error) {
    console.error("Aceitar captação error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
