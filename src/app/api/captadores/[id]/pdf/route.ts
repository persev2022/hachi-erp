import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const config = await prisma.systemConfig.findFirst({
      where: { key: `captacao_${session.tenantId}_${id}` },
    });

    if (!config) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    const captacao = JSON.parse(config.value);
    const d = captacao.dados;

    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>Questionário de Captação</title>
<style>
@media print { body { margin: 0; } .no-print { display: none; } }
body { font-family: -apple-system, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; font-size: 13px; color: #1f2937; }
h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
h2 { font-size: 14px; margin-top: 24px; padding-bottom: 4px; border-bottom: 2px solid #0d9488; color: #0d9488; }
.subtitle { text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 20px; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
td { padding: 5px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
td:first-child { font-weight: 500; background: #f9fafb; width: 40%; }
.status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.status-pendente { background: #fef3c7; color: #92400e; }
.status-aceito { background: #d1fae5; color: #065f46; }
.btn-print { display: block; margin: 20px auto; padding: 10px 24px; background: #0d9488; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
</style></head><body>
<h1>QUESTIONÁRIO DE CAPTAÇÃO</h1>
<p class="subtitle">Enviado em ${new Date(captacao.criadoEm).toLocaleString("pt-BR")} · Status: <span class="status status-${captacao.status}">${captacao.status.toUpperCase()}</span></p>

<h2>1. Dados do Paciente</h2>
<table>
<tr><td>Nome</td><td>${d.pacienteNome || "—"}</td></tr>
<tr><td>CPF</td><td>${d.pacienteCpf || "—"}</td></tr>
<tr><td>RG</td><td>${d.pacienteRg || "—"}</td></tr>
<tr><td>Data de Nascimento</td><td>${d.pacienteNascimento || "—"}</td></tr>
<tr><td>Sexo</td><td>${d.pacienteSexo || "—"}</td></tr>
<tr><td>Tipo Sanguíneo</td><td>${d.tipoSanguineo || "—"}</td></tr>
<tr><td>Estado Civil</td><td>${d.pacienteEstadoCivil || "—"}</td></tr>
<tr><td>Profissão</td><td>${d.pacienteProfissao || "—"}</td></tr>
<tr><td>Escolaridade</td><td>${d.escolaridade || "—"}</td></tr>
<tr><td>Telefone</td><td>${d.pacienteTelefone || "—"}</td></tr>
<tr><td>Email</td><td>${d.pacienteEmail || "—"}</td></tr>
<tr><td>Endereço</td><td>${d.pacienteEndereco || "—"}</td></tr>
</table>

<h2>2. Dados Clínicos</h2>
<table>
<tr><td>Substâncias</td><td>${d.substancias || "—"}</td></tr>
<tr><td>Tempo de uso</td><td>${d.tempoUso || "—"}</td></tr>
<tr><td>Frequência</td><td>${d.frequenciaUso || "—"}</td></tr>
<tr><td>Último uso</td><td>${d.ultimoUso || "—"}</td></tr>
<tr><td>Internações anteriores</td><td>${d.internacoesAnteriores || "—"}</td></tr>
<tr><td>Comorbidades</td><td>${d.comorbidades || "—"}</td></tr>
<tr><td>Medicamentos em uso</td><td>${d.medicamentos || "—"}</td></tr>
<tr><td>Alergias</td><td>${d.alergias || "—"}</td></tr>
<tr><td>Doenças crônicas</td><td>${d.doencasCronicas || "—"}</td></tr>
<tr><td>Tentativa de suicídio</td><td>${d.tentativaSuicidio || "—"}</td></tr>
<tr><td>Comportamento violento</td><td>${d.comportamentoViolento || "—"}</td></tr>
</table>

<h2>3. Responsável Financeiro</h2>
<table>
<tr><td>Nome</td><td>${d.responsavelNome || "—"}</td></tr>
<tr><td>CPF</td><td>${d.responsavelCpf || "—"}</td></tr>
<tr><td>RG</td><td>${d.responsavelRg || "—"}</td></tr>
<tr><td>Parentesco</td><td>${d.responsavelParentesco || "—"}</td></tr>
<tr><td>Telefone</td><td>${d.responsavelTelefone || "—"}</td></tr>
<tr><td>Email</td><td>${d.responsavelEmail || "—"}</td></tr>
<tr><td>Endereço</td><td>${d.responsavelEndereco || "—"}</td></tr>
</table>

<h2>4. Informações da Internação</h2>
<table>
<tr><td>Tipo</td><td>${d.tipoInternacao || "—"}</td></tr>
<tr><td>Quem busca tratamento</td><td>${d.quemBusca || "—"}</td></tr>
<tr><td>Paciente sabe?</td><td>${d.pacienteSabe || "—"}</td></tr>
<tr><td>Paciente concorda?</td><td>${d.pacienteConcorda || "—"}</td></tr>
<tr><td>Necessita translado?</td><td>${d.necessitaTranslado || "—"}</td></tr>
<tr><td>Data pretendida</td><td>${d.dataPretendida || "—"}</td></tr>
<tr><td>Valor mensalidade</td><td>R$ ${d.valorMensalidade || "—"}</td></tr>
<tr><td>Plano de tratamento</td><td>${d.planoTratamento || "—"}</td></tr>
</table>

<h2>5. Informações Complementares</h2>
<table>
<tr><td>Pertences</td><td>${d.pertences || "—"}</td></tr>
<tr><td>Restrição alimentar</td><td>${d.restricaoAlimentar || "—"}</td></tr>
<tr><td>Religião</td><td>${d.religiao || "—"}</td></tr>
<tr><td>Filhos menores</td><td>${d.filhosMenores || "—"}</td></tr>
<tr><td>Benefício INSS</td><td>${d.beneficioInss || "—"}</td></tr>
<tr><td>Pendências judiciais</td><td>${d.pendenciasJudiciais || "—"}</td></tr>
<tr><td>Observações</td><td>${d.observacoes || "—"}</td></tr>
</table>

<h2>6. Dados do Captador</h2>
<table>
<tr><td>Nome</td><td>${d.captadorNome || "—"}</td></tr>
<tr><td>CPF</td><td>${d.captadorCpf || "—"}</td></tr>
<tr><td>Telefone</td><td>${d.captadorTelefone || "—"}</td></tr>
<tr><td>Email</td><td>${d.captadorEmail || "—"}</td></tr>
<tr><td>Chave PIX</td><td>${d.captadorPix || "—"}</td></tr>
</table>

<button class="btn-print no-print" onclick="window.print()">Salvar como PDF</button>
</body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Captação PDF error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
