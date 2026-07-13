import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate PDF from signed form data (public route — anyone with token can download)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: `form_link_${token}` },
    });

    if (!config) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    const formData = JSON.parse(config.value);

    if (formData.status !== "assinado") {
      return NextResponse.json({ error: "Formulário ainda não foi assinado" }, { status: 400 });
    }

    const dados = formData.dados || {};
    const assinatura = formData.assinatura || {};
    const tipo = formData.tipo;

    // Build HTML for PDF
    const html = buildPdfHtml(tipo, dados, assinatura);

    // Return HTML with print-friendly headers (client will use window.print() or browser PDF)
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${tipo}_${token.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

function buildPdfHtml(tipo: string, dados: Record<string, any>, assinatura: any): string {
  const title = tipo === "reserva-vaga"
    ? "SOLICITAÇÃO DE RESERVA DE VAGA E PRÉ-CADASTRO"
    : "ORDEM DE SERVIÇO — TRANSPORTE ASSISTIDO";

  const rows = Object.entries(dados)
    .filter(([key]) => !["aceite", "assinaturaNome", "local"].includes(key))
    .map(([key, value]) => {
      const label = formatLabel(key);
      return `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:500;width:40%;background:#f9fafb;font-size:13px">${label}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;font-size:13px">${value || "—"}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1f2937; line-height: 1.5; }
  h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
  .subtitle { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 30px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .signature-box { margin-top: 40px; border-top: 2px solid #0d9488; padding-top: 20px; }
  .hash { font-family: monospace; font-size: 10px; color: #6b7280; word-break: break-all; }
  .btn-print { display: block; margin: 30px auto 0; padding: 12px 32px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-print:hover { background: #0f766e; }
</style>
</head>
<body>
<h1>${title}</h1>
<p class="subtitle">Documento assinado digitalmente — ${new Date(assinatura.dataHora).toLocaleString("pt-BR")}</p>

<table>${rows}</table>

<div class="signature-box">
  <p style="margin:0;font-size:14px"><strong>Assinatura Digital</strong></p>
  <p style="margin:8px 0 4px;font-size:13px">Nome: <strong>${assinatura.nome || dados.assinaturaNome || "—"}</strong></p>
  ${dados.local ? `<p style="margin:0 0 4px;font-size:13px">Local: ${dados.local}</p>` : ""}
  <p style="margin:0 0 4px;font-size:13px">Data/Hora: ${new Date(assinatura.dataHora).toLocaleString("pt-BR")}</p>
  <p style="margin:0 0 4px;font-size:13px">IP: ${assinatura.ip || "—"}</p>
  <p style="margin:0 0 4px;font-size:13px">Algoritmo: ${assinatura.algoritmo || "SHA-256"}</p>
  <p class="hash" style="margin-top:8px">Hash: ${assinatura.hash || "—"}</p>
  <p style="margin-top:12px;font-size:11px;color:#6b7280">Este documento foi assinado eletronicamente conforme Lei 14.063/2020. A integridade pode ser verificada pelo hash SHA-256 acima.</p>
</div>

<button class="btn-print no-print" onclick="window.print()">Salvar como PDF</button>
</body>
</html>`;
}

function formatLabel(key: string): string {
  const map: Record<string, string> = {
    respNome: "Nome do Responsável",
    respRg: "RG do Responsável",
    respCpf: "CPF do Responsável",
    respEstadoCivil: "Estado Civil (Responsável)",
    respProfissao: "Profissão (Responsável)",
    respTel1: "Telefone 1 (Responsável)",
    respTel2: "Telefone 2 (Responsável)",
    respEmail: "E-mail (Responsável)",
    respEndereco: "Endereço (Responsável)",
    respBairro: "Bairro (Responsável)",
    respCidade: "Cidade/UF (Responsável)",
    respCep: "CEP (Responsável)",
    pacNome: "Nome do Paciente",
    pacRg: "RG do Paciente",
    pacCpf: "CPF do Paciente",
    pacEstadoCivil: "Estado Civil (Paciente)",
    pacProfissao: "Profissão (Paciente)",
    pacNascimento: "Data de Nascimento",
    pacEndereco: "Endereço (Paciente)",
    pacCidade: "Cidade/UF (Paciente)",
    pacNasc: "Data de Nascimento",
    pacIdade: "Idade",
    pacEnderecoColeta: "Endereço de Coleta",
    osData: "Data da OS",
    osHora: "Hora",
    osResponsavel: "Responsável pela Abertura",
    solNome: "Nome do Solicitante",
    solCpf: "CPF do Solicitante",
    solRg: "RG do Solicitante",
    solParentesco: "Parentesco",
    solTelefone: "Telefone do Solicitante",
    solEndereco: "Endereço do Solicitante",
    modalidade: "Modalidade de Atendimento",
    tipoAtendimento: "Tipo",
    nivelUrgencia: "Nível de Urgência",
    origem: "Origem",
    destino: "Destino (Unidade)",
    cidadeDestino: "Cidade Destino",
    valor: "Valor (R$)",
    formaPagamento: "Forma de Pagamento",
  };
  return map[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
