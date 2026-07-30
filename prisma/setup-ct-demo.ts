/**
 * CT DEMO — Full mock data for video demo recording.
 * Creates an isolated tenant with realistic data across ALL modules.
 * 
 * Login: admin@ct-demo.com / Admin@Demo2026
 * 
 * Run: npx tsx prisma/setup-ct-demo.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🎬 Criando CT DEMO para gravação de demonstração...\n");

  // ═══ 1. TENANT ═══
  const tenant = await prisma.tenant.upsert({
    where: { slug: "ct-demo" },
    update: {},
    create: {
      name: "CT Demo",
      slug: "ct-demo",
      vertical: "recovery",
      plan: "enterprise",
      active: true,
      config: {
        features: {
          financeiro: true, agenda: true, documentos: true, estoque: true,
          comunicacao: true, relatorios: true, configuracoes: true,
          prontuario: true, portalFamilia: true, quartos: true, prescricoes: true,
          crm: false, pdv: false, delivery: false, reservas: false,
          captadores: true, formularios: true, ferramentas: false,
        },
        branding: { name: "CT Demo", primaryColor: "#0d9488", logo: "/images/hachi-logo.png" },
      },
    },
  });
  const tenantId = tenant.id;
  console.log(`  ✓ Tenant: ${tenant.name} (${tenantId})`);

  // ═══ 2. USERS ═══
  const pwd = await bcrypt.hash("Admin@Demo2026", 12);
  const users = [
    { email: "admin@ct-demo.com", name: "Dr. Roberto Mendes", role: "ADMIN" as const },
    { email: "coord@ct-demo.com", name: "Ana Paula Silva", role: "COORDENADOR" as const },
    { email: "medico@ct-demo.com", name: "Dr. Carlos Ferreira", role: "MEDICO" as const },
    { email: "psi@ct-demo.com", name: "Dra. Mariana Costa", role: "PSICOLOGO" as const },
    { email: "enf@ct-demo.com", name: "Enf. Juliana Santos", role: "ENFERMEIRO" as const },
    { email: "tera@ct-demo.com", name: "Lucas Oliveira", role: "TERAPEUTA" as const },
    { email: "sec@ct-demo.com", name: "Camila Rodrigues", role: "SECRETARIA" as const },
  ];

  const createdUsers: any[] = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { tenantId },
      create: { ...u, password: pwd, tenantId, active: true },
    });
    createdUsers.push(user);
  }
  console.log(`  ✓ ${createdUsers.length} usuários criados`);

  // ═══ 3. QUARTOS ═══
  const quartos = [];
  for (let i = 1; i <= 8; i++) {
    const q = await prisma.quarto.upsert({
      where: { numero: `D${String(i).padStart(2, "0")}` },
      update: { tenantId },
      create: { numero: `D${String(i).padStart(2, "0")}`, andar: Math.ceil(i / 4), capacidade: 3, status: i <= 6 ? "OCUPADO" : "DISPONIVEL", tipo: "Triplo", tenantId },
    });
    quartos.push(q);
  }
  console.log(`  ✓ ${quartos.length} quartos`);

  // ═══ 4. PACIENTES (12 acolhidos com dados completos) ═══
  const pacientesData = [
    { nome: "Pedro Henrique Almeida", cpf: "98765432100", nasc: "1992-03-15", sexo: "M", substancia: "Crack", tempo: "8 anos", dias: 180, mensalidade: 2500, venc: 5, quarto: 0 },
    { nome: "Rafael Costa Souza", cpf: "98765432101", nasc: "1988-07-22", sexo: "M", substancia: "Álcool", tempo: "12 anos", dias: 90, mensalidade: 2800, venc: 20, quarto: 0 },
    { nome: "Marcos Vinícius Lima", cpf: "98765432102", nasc: "1995-01-10", sexo: "M", substancia: "Cocaína", tempo: "5 anos", dias: 90, mensalidade: 3000, venc: 5, quarto: 1 },
    { nome: "Diego Ferreira Nunes", cpf: "98765432103", nasc: "1990-11-03", sexo: "M", substancia: "Múltiplas", tempo: "10 anos", dias: 180, mensalidade: 2200, venc: 20, quarto: 1 },
    { nome: "Lucas Gabriel Martins", cpf: "98765432104", nasc: "1997-05-28", sexo: "M", substancia: "Maconha", tempo: "6 anos", dias: 90, mensalidade: 1800, venc: 5, quarto: 2 },
    { nome: "Thiago Ribeiro Santos", cpf: "98765432105", nasc: "1985-09-14", sexo: "M", substancia: "Álcool", tempo: "15 anos", dias: 270, mensalidade: 2500, venc: 20, quarto: 2 },
    { nome: "Anderson Silva Pereira", cpf: "98765432106", nasc: "1993-12-07", sexo: "M", substancia: "Crack", tempo: "7 anos", dias: 180, mensalidade: 2000, venc: 5, quarto: 3 },
    { nome: "Felipe Augusto Rocha", cpf: "98765432107", nasc: "1991-04-19", sexo: "M", substancia: "Cocaína", tempo: "4 anos", dias: 90, mensalidade: 3200, venc: 20, quarto: 3 },
    { nome: "Bruno Carvalho Dias", cpf: "98765432108", nasc: "1989-08-25", sexo: "M", substancia: "Álcool", tempo: "9 anos", dias: 180, mensalidade: 2600, venc: 5, quarto: 4 },
    { nome: "Gustavo Mendes Oliveira", cpf: "98765432109", nasc: "1994-02-12", sexo: "M", substancia: "Crack", tempo: "6 anos", dias: 90, mensalidade: 2400, venc: 20, quarto: 4 },
    { nome: "Ricardo Nascimento", cpf: "98765432110", nasc: "1987-06-30", sexo: "M", substancia: "Múltiplas", tempo: "11 anos", dias: 270, mensalidade: 2100, venc: 5, quarto: 5 },
    { nome: "João Pedro Azevedo", cpf: "98765432111", nasc: "1996-10-08", sexo: "M", substancia: "Cocaína", tempo: "3 anos", dias: 90, mensalidade: 2800, venc: 20, quarto: 5 },
  ];

  const pacientes: any[] = [];
  for (const p of pacientesData) {
    const existing = await prisma.paciente.findFirst({ where: { cpf: p.cpf } });
    if (existing) { pacientes.push(existing); continue; }

    const pac = await prisma.paciente.create({
      data: {
        nome: p.nome, cpf: p.cpf, dataNascimento: new Date(p.nasc), sexo: p.sexo,
        estadoCivil: "SOLTEIRO", substanciaPrincipal: p.substancia, tempoUso: p.tempo,
        internacoesPrevias: Math.floor(Math.random() * 3),
        dataAdmissao: new Date(Date.now() - Math.random() * 60 * 86400000),
        diasTratamento: p.dias, mensalidadeValor: p.mensalidade, diaVencimento: p.venc,
        quartoId: quartos[p.quarto].id, status: "ATIVO", tenantId,
      },
    });
    pacientes.push(pac);

    // Responsável
    await prisma.responsavel.create({
      data: {
        pacienteId: pac.id, nome: `Maria ${p.nome.split(" ")[1] || "Silva"}`,
        cpf: `${p.cpf.slice(0, -1)}9`, parentesco: "Mãe",
        telefone: `5548${String(900000000 + Math.floor(Math.random() * 99999999)).slice(0, 9)}`,
        isFinanceiro: true,
      },
    });
  }
  console.log(`  ✓ ${pacientes.length} pacientes com responsáveis`);

  // ═══ 5. EVOLUÇÕES (múltiplas por paciente) ═══
  const tiposEvolucao = ["MEDICA", "PSICOLOGICA", "ENFERMAGEM", "TERAPEUTICA", "SOCIAL"] as const;
  const conteudos = [
    "Paciente apresenta melhora significativa no humor e disposição. Participou ativamente da terapia de grupo. Sono regularizado.",
    "Relata ansiedade moderada. Trabalhamos técnicas de respiração e mindfulness. Demonstra boa adesão ao tratamento.",
    "Sinais vitais estáveis. PA 120/80, FC 72. Medicação administrada conforme prescrição. Sem queixas.",
    "Participou da atividade de arteterapia. Expressou sentimentos de forma construtiva. Interação positiva com o grupo.",
    "Família visitou hoje. Contato afetuoso. Paciente emocionado mas estável. Reforçado vínculo familiar.",
    "Boa adesão à rotina. Auxiliou nas tarefas do centro. Demonstra responsabilidade crescente.",
    "Queixa de insônia leve. Orientado sobre higiene do sono. Encaminhado para avaliação psiquiátrica.",
    "Momento de irritabilidade pela manhã. Mediação realizada com sucesso. Reflexão sobre gatilhos emocionais.",
  ];

  let evolCount = 0;
  const medico = createdUsers.find((u) => u.role === "MEDICO")!;
  const psi = createdUsers.find((u) => u.role === "PSICOLOGO")!;
  const enf = createdUsers.find((u) => u.role === "ENFERMEIRO")!;
  const tera = createdUsers.find((u) => u.role === "TERAPEUTA")!;
  const profissionais = [medico, psi, enf, tera, psi];

  for (const pac of pacientes) {
    const numEvol = 4 + Math.floor(Math.random() * 6); // 4-9 evolutions per patient
    for (let i = 0; i < numEvol; i++) {
      const tipo = tiposEvolucao[i % tiposEvolucao.length];
      const prof = profissionais[i % profissionais.length];
      await prisma.evolucao.create({
        data: {
          pacienteId: pac.id,
          profissionalId: prof.id,
          tipo,
          conteudo: conteudos[Math.floor(Math.random() * conteudos.length)],
          assinado: Math.random() > 0.3,
          assinadoEm: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 86400000) : null,
          createdAt: new Date(Date.now() - Math.random() * 45 * 86400000),
        },
      });
      evolCount++;
    }
  }
  console.log(`  ✓ ${evolCount} evoluções clínicas`);

  // ═══ 6. PRESCRIÇÕES ═══
  const medicamentos = [
    { med: "Sertralina 50mg", dos: "1cp", via: "Oral", freq: "1x/dia manhã" },
    { med: "Clonazepam 2mg", dos: "1cp", via: "Oral", freq: "1x/dia noite" },
    { med: "Naltrexona 50mg", dos: "1cp", via: "Oral", freq: "1x/dia" },
    { med: "Quetiapina 25mg", dos: "1cp", via: "Oral", freq: "1x/dia noite" },
    { med: "Vitamina B12", dos: "1amp", via: "IM", freq: "1x/semana" },
    { med: "Diazepam 10mg", dos: "1cp", via: "Oral", freq: "8/8h (desmame)" },
  ];

  let prescCount = 0;
  for (const pac of pacientes) {
    const numPresc = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPresc; i++) {
      const m = medicamentos[Math.floor(Math.random() * medicamentos.length)];
      await prisma.prescricao.create({
        data: {
          pacienteId: pac.id, medicoId: medico.id,
          medicamento: m.med, dosagem: m.dos, via: m.via, frequencia: m.freq,
          duracao: "Contínuo", ativa: true,
        },
      });
      prescCount++;
    }
  }
  console.log(`  ✓ ${prescCount} prescrições`);

  // ═══ 7. AGENDAMENTOS ═══
  const tiposAgenda = ["Consulta Médica", "Sessão Psicologia", "Terapia de Grupo", "Avaliação Enfermagem", "Reunião Familiar"];
  let agendaCount = 0;
  for (const pac of pacientes.slice(0, 8)) {
    for (let i = 0; i < 3; i++) {
      const futureDate = new Date(Date.now() + (i + 1) * 3 * 86400000);
      futureDate.setHours(8 + Math.floor(Math.random() * 8), 0, 0, 0);
      await prisma.agendamento.create({
        data: {
          pacienteId: pac.id,
          profissionalId: profissionais[i % profissionais.length].id,
          tipo: tiposAgenda[i % tiposAgenda.length],
          dataHora: futureDate,
          duracao: 50,
          status: "AGENDADO",
        },
      });
      agendaCount++;
    }
  }
  console.log(`  ✓ ${agendaCount} agendamentos futuros`);

  // ═══ 8. FINANCEIRO (3 meses de movimentações) ═══
  let finCount = 0;
  for (let month = 0; month < 3; month++) {
    const mesDate = new Date();
    mesDate.setMonth(mesDate.getMonth() - month);

    // Receitas (mensalidades)
    for (const pac of pacientes) {
      const vencimento = new Date(mesDate.getFullYear(), mesDate.getMonth(), pac.diaVencimento || 5);
      const pago = month > 0 || Math.random() > 0.3; // Current month some pending
      await prisma.movimentacaoFinanceira.create({
        data: {
          pacienteId: pac.id,
          tipo: "RECEITA",
          categoria: "MENSALIDADE",
          descricao: `Mensalidade ${mesDate.toLocaleDateString("pt-BR", { month: "long" })}`,
          valor: pac.mensalidadeValor || 2500,
          dataVencimento: vencimento,
          dataPagamento: pago ? new Date(vencimento.getTime() + Math.random() * 5 * 86400000) : null,
          status: pago ? "PAGO" : month === 0 ? "PENDENTE" : "ATRASADO",
          formaPagamento: pago ? (Math.random() > 0.5 ? "Pix" : "Boleto") : null,
          tenantId,
        },
      });
      finCount++;
    }

    // Despesas
    const despesas = [
      { cat: "ALIMENTACAO" as const, desc: "Alimentação mensal", valor: 8500 },
      { cat: "MEDICAMENTO" as const, desc: "Farmácia", valor: 3200 },
      { cat: "OUTRO" as const, desc: "Energia elétrica", valor: 1800 },
      { cat: "OUTRO" as const, desc: "Água e esgoto", valor: 450 },
      { cat: "LAVANDERIA" as const, desc: "Lavanderia", valor: 1200 },
      { cat: "OUTRO" as const, desc: "Manutenção predial", valor: 900 },
    ];
    for (const d of despesas) {
      await prisma.movimentacaoFinanceira.create({
        data: {
          tipo: "DESPESA", categoria: d.cat, descricao: d.desc,
          valor: d.valor + Math.floor(Math.random() * 500),
          dataVencimento: new Date(mesDate.getFullYear(), mesDate.getMonth(), 10 + Math.floor(Math.random() * 15)),
          dataPagamento: new Date(mesDate.getFullYear(), mesDate.getMonth(), 12 + Math.floor(Math.random() * 10)),
          status: "PAGO", formaPagamento: "Boleto", tenantId,
        },
      });
      finCount++;
    }
  }
  console.log(`  ✓ ${finCount} movimentações financeiras (3 meses)`);

  // ═══ 9. ESTOQUE ═══
  const itensEstoque = [
    { nome: "Sertralina 50mg (cx)", cat: "MEDICAMENTO" as const, un: "Cx", qty: 15, min: 5 },
    { nome: "Clonazepam 2mg (cx)", cat: "MEDICAMENTO" as const, un: "Cx", qty: 8, min: 3 },
    { nome: "Luvas descartáveis", cat: "MATERIAL_HOSPITALAR" as const, un: "Cx", qty: 20, min: 5 },
    { nome: "Álcool 70%", cat: "HIGIENE" as const, un: "L", qty: 12, min: 4 },
    { nome: "Papel higiênico", cat: "HIGIENE" as const, un: "Fardo", qty: 6, min: 3 },
    { nome: "Desinfetante", cat: "LIMPEZA" as const, un: "L", qty: 10, min: 4 },
    { nome: "Arroz 5kg", cat: "ALIMENTO" as const, un: "Pct", qty: 8, min: 3 },
    { nome: "Feijão 1kg", cat: "ALIMENTO" as const, un: "Pct", qty: 15, min: 5 },
    { nome: "Roupa de cama", cat: "ROUPA_CAMA" as const, un: "Jogo", qty: 24, min: 12 },
    { nome: "Toalha de banho", cat: "ROUPA_CAMA" as const, un: "Un", qty: 30, min: 12 },
  ];

  for (const item of itensEstoque) {
    await prisma.itemEstoque.create({
      data: { nome: item.nome, categoria: item.cat, unidade: item.un, quantidade: item.qty, minimo: item.min, tenantId },
    });
  }
  console.log(`  ✓ ${itensEstoque.length} itens de estoque`);

  // ═══ 10. AVALIAÇÕES MULTIDISCIPLINARES ═══
  for (const pac of pacientes.slice(0, 6)) {
    const key = `avaliacao_${tenantId}_${pac.id}_INDIVIDUAL_${Date.now()}_${Math.random()}`;
    await prisma.systemConfig.create({
      data: {
        key,
        value: JSON.stringify({
          pacienteId: pac.id, pacienteNome: pac.nome, tipo: "INDIVIDUAL",
          semanaInicio: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
          semanaFim: new Date().toISOString().split("T")[0],
          dados: {
            conscienciaEmocional: ["BAIXA", "MEDIA", "BOA"][Math.floor(Math.random() * 3)],
            reatividade: ["VERMELHO", "AMARELO", "VERDE"][Math.floor(Math.random() * 3)],
            participacao: ["PASSIVA", "REGULAR", "ATIVA"][Math.floor(Math.random() * 3)],
            cumprimentoRotina: ["FRACO", "REGULAR", "BOM"][Math.floor(Math.random() * 3)],
            vinculoCentro: ["INSTAVEL", "EM_CONSTRUCAO", "ESTAVEL"][Math.floor(Math.random() * 3)],
            nivelRisco: ["ESTAVEL", "ATENCAO", "EM_CRISE"][Math.floor(Math.random() * 3)],
          },
          score: 40 + Math.floor(Math.random() * 50),
          criadoPor: psi.id, criadoEm: new Date().toISOString(), tenantId,
        }),
      },
    });
  }
  console.log(`  ✓ 6 avaliações multidisciplinares`);

  console.log("\n═══════════════════════════════════════");
  console.log("✅ CT DEMO configurado com sucesso!");
  console.log(`   Login: admin@ct-demo.com / Admin@Demo2026`);
  console.log(`   Tenant ID: ${tenantId}`);
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => { console.error("❌ Erro:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
