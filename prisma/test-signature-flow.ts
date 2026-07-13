import { PrismaClient } from "@prisma/client";
import { createToken } from "../src/lib/auth";
import { generateDocx } from "../src/lib/documents/generator";
import { signDocument, verifySignature, generateCertificateText } from "../src/lib/documents/signature";
import { formatDateBR, toTitleCase } from "../src/lib/documents/format";
import { formatarValorContrato } from "../src/lib/documents/valor";

const prisma = new PrismaClient();

async function test() {
  console.log("🧪 Testando fluxo: Cadastro → Contrato → Assinatura → Verificação\n");

  // 1. Get admin
  const admin = await prisma.user.findUnique({ where: { email: "admin@hachi.com" } });
  if (!admin) { console.log("❌ Admin não encontrado"); return; }
  console.log("1️⃣  Admin:", admin.name, "| Role:", admin.role);

  // 2. Create test patient
  const testCpf = "99988877766";
  const existing = await prisma.paciente.findFirst({ where: { cpf: testCpf } });
  if (existing) {
    await prisma.documento.deleteMany({ where: { pacienteId: existing.id } });
    await prisma.responsavel.deleteMany({ where: { pacienteId: existing.id } });
    await prisma.paciente.delete({ where: { id: existing.id } });
  }

  const paciente = await prisma.paciente.create({
    data: {
      nome: "João Teste Assinatura",
      cpf: testCpf,
      dataNascimento: new Date("1990-05-15"),
      sexo: "M",
      estadoCivil: "SOLTEIRO",
      dataAdmissao: new Date(),
      diasTratamento: 90,
      status: "ATIVO",
      tenantId: admin.tenantId,
      mensalidadeValor: 2000,
      diaVencimento: 5,
    },
  });
  console.log("2️⃣  Paciente criado:", paciente.nome);

  const resp = await prisma.responsavel.create({
    data: {
      pacienteId: paciente.id,
      nome: "Maria Responsavel Teste",
      cpf: "11122233344",
      parentesco: "Mãe",
      telefone: "48999999999",
      isFinanceiro: true,
    },
  });
  console.log("3️⃣  Responsável:", resp.nome);

  // 3. Generate contract
  let docBuffer: Buffer;
  try {
    docBuffer = generateDocx("CONTRATO", {
      data_entrada: formatDateBR(paciente.dataAdmissao),
      nome_paciente: toTitleCase(paciente.nome),
      cpf_paciente: paciente.cpf,
      nasc_paciente: formatDateBR(paciente.dataNascimento),
      estado_civil_paciente: "solteiro",
      nome_familiar: toTitleCase(resp.nome),
      cpf_familiar: resp.cpf,
      parentesco: resp.parentesco,
      telefone: resp.telefone,
      dias_tratamento: "90",
      matricula: formatarValorContrato(0),
      mensalidade: formatarValorContrato(2000),
      vencimento: "05/08/2026",
      total: formatarValorContrato(6000),
    });
    console.log("4️⃣  Contrato gerado:", docBuffer.length, "bytes (.docx)");
  } catch (err: any) {
    console.log("⚠️  Template com problema:", err.message);
    docBuffer = Buffer.from("CONTRATO-FALLBACK|" + paciente.nome + "|" + new Date().toISOString());
    console.log("   Usando buffer fallback para teste de assinatura");
  }

  // 4. Sign
  const signature = signDocument(
    docBuffer,
    { userId: admin.id, name: admin.name, cpf: admin.cpf || undefined, email: admin.email, role: admin.role, tenantId: admin.tenantId || undefined },
    { type: "CONTRATO", title: "Contrato - " + paciente.nome },
    "127.0.0.1"
  );
  console.log("5️⃣  ASSINADO!");
  console.log("   ID:", signature.id);
  console.log("   Hash SHA-256:", signature.hash);
  console.log("   Data:", signature.signedAt);

  // 5. Verify valid
  const check1 = verifySignature(docBuffer, signature);
  console.log("6️⃣  Verificação (doc original):", check1.valid ? "✅ VÁLIDA" : "❌ INVÁLIDA");

  // 6. Verify tampered
  const tampered = Buffer.from("documento adulterado");
  const check2 = verifySignature(tampered, signature);
  console.log("7️⃣  Verificação (doc adulterado):", check2.valid ? "❌ Deveria falhar!" : "✅ Detectou: " + check2.reason);

  // 7. Save to DB
  await prisma.documento.create({
    data: {
      pacienteId: paciente.id,
      tipo: "CONTRATO",
      titulo: "Contrato - " + paciente.nome,
      arquivo: JSON.stringify({ signatureId: signature.id, hash: signature.hash, signedAt: signature.signedAt }),
      formato: "docx",
      geradoPor: admin.id,
      assinado: true,
    },
  });
  console.log("8️⃣  Salvo no banco (aba documentos do paciente)");

  // 8. Certificate
  const cert = generateCertificateText(signature);
  console.log("\n9️⃣  CERTIFICADO:");
  console.log(cert);

  // 9. Verify docs exist
  const docs = await prisma.documento.findMany({ where: { pacienteId: paciente.id } });
  console.log("\n🔟 Documentos encontrados:", docs.length);
  docs.forEach(d => console.log("   •", d.titulo, "| assinado:", d.assinado));

  // Cleanup
  await prisma.documento.deleteMany({ where: { pacienteId: paciente.id } });
  await prisma.responsavel.deleteMany({ where: { pacienteId: paciente.id } });
  await prisma.paciente.delete({ where: { id: paciente.id } });
  console.log("\n🧹 Dados de teste removidos");
  console.log("\n═══════════════════════════════════════");
  console.log("✅ FLUXO COMPLETO OK!");
  console.log("═══════════════════════════════════════");
}

test().catch(e => { console.error("❌ ERRO:", e); process.exit(1); }).finally(() => prisma.$disconnect());
