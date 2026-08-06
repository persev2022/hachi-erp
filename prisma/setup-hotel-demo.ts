/**
 * HOTEL DEMO — Full mock data for hotel vertical demonstration.
 * Terminologia: Hóspede, UH (Unidade Habitacional), Check-in/out, Diárias
 * 
 * Login: admin@hotel-demo.com / Admin@Hotel2026
 * 
 * Features enabled: financeiro, agenda, documentos, estoque, comunicacao,
 * relatorios, configuracoes, quartos, crm, reservas
 * 
 * Run: npx tsx prisma/setup-hotel-demo.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🏨 Configurando Hotel Demo com dados completos...\n");

  // Find existing hotel-demo tenant
  const tenant = await prisma.tenant.findUnique({ where: { slug: "hotel-demo" } });
  if (!tenant) { console.error("❌ Tenant hotel-demo não encontrado. Execute setup-all-verticals.ts primeiro."); process.exit(1); }
  const tenantId = tenant.id;
  console.log(`  ✓ Tenant: ${tenant.name} (${tenantId})`);

  // Ensure admin user exists
  const pwd = await bcrypt.hash("Admin@Hotel2026", 12);
  await prisma.user.upsert({
    where: { email: "admin@hotel-demo.com" },
    update: { tenantId },
    create: { email: "admin@hotel-demo.com", password: pwd, name: "Admin Hotel", role: "ADMIN", tenantId, active: true },
  });

  // Extra users
  const users = [
    { email: "recep@hotel-demo.com", name: "Carolina Mendes", role: "SECRETARIA" as const },
    { email: "gerente@hotel-demo.com", name: "Ricardo Alves", role: "COORDENADOR" as const },
    { email: "financeiro@hotel-demo.com", name: "Amanda Costa", role: "FINANCEIRO" as const },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, update: { tenantId }, create: { ...u, password: pwd, tenantId, active: true } });
  }
  console.log(`  ✓ 4 usuários`);

  // ═══ QUARTOS (UHs) ═══
  const uhData = [
    { numero: "101", andar: 1, tipo: "Standard", cap: 2 },
    { numero: "102", andar: 1, tipo: "Standard", cap: 2 },
    { numero: "103", andar: 1, tipo: "Luxo", cap: 2 },
    { numero: "201", andar: 2, tipo: "Standard", cap: 2 },
    { numero: "202", andar: 2, tipo: "Luxo", cap: 3 },
    { numero: "203", andar: 2, tipo: "Suíte Master", cap: 2 },
    { numero: "301", andar: 3, tipo: "Suíte Presidencial", cap: 4 },
    { numero: "302", andar: 3, tipo: "Luxo", cap: 2 },
    { numero: "303", andar: 3, tipo: "Standard", cap: 2 },
    { numero: "304", andar: 3, tipo: "Standard", cap: 2 },
  ];

  const quartos: any[] = [];
  for (const uh of uhData) {
    const q = await prisma.quarto.upsert({
      where: { numero: uh.numero },
      update: { tenantId, tipo: uh.tipo },
      create: { numero: uh.numero, andar: uh.andar, capacidade: uh.cap, status: "DISPONIVEL", tipo: uh.tipo, tenantId },
    });
    quartos.push(q);
  }
  console.log(`  ✓ ${quartos.length} UHs (unidades habitacionais)`);

  // ═══ HÓSPEDES ═══
  const hospedes = [
    { nome: "Carlos Eduardo Silva", cpf: "11122233344", nasc: "1985-03-12", sexo: "M", tel: "11988001122", cidade: "São Paulo", dias: 5, valor: 450, quarto: 0 },
    { nome: "Maria Fernanda Oliveira", cpf: "11122233345", nasc: "1990-07-22", sexo: "F", tel: "21977882233", cidade: "Rio de Janeiro", dias: 3, valor: 650, quarto: 2 },
    { nome: "João Pedro Martins", cpf: "11122233346", nasc: "1978-11-05", sexo: "M", tel: "47999113344", cidade: "Florianópolis", dias: 7, valor: 350, quarto: 3 },
    { nome: "Ana Clara Rodrigues", cpf: "11122233347", nasc: "1992-01-18", sexo: "F", tel: "48988556677", cidade: "Curitiba", dias: 2, valor: 1200, quarto: 5 },
    { nome: "Roberto Nascimento", cpf: "11122233348", nasc: "1968-09-30", sexo: "M", tel: "51966778899", cidade: "Porto Alegre", dias: 4, valor: 550, quarto: 4 },
    { nome: "Fernanda Lima Costa", cpf: "11122233349", nasc: "1995-05-14", sexo: "F", tel: "31955443322", cidade: "Belo Horizonte", dias: 6, valor: 2500, quarto: 6 },
    { nome: "Paulo Henrique Dias", cpf: "11122233350", nasc: "1982-12-25", sexo: "M", tel: "41944332211", cidade: "Joinville", dias: 3, valor: 400, quarto: 7 },
    { nome: "Luciana Ferreira", cpf: "11122233351", nasc: "1988-06-08", sexo: "F", tel: "11933221100", cidade: "Campinas", dias: 5, valor: 350, quarto: 8 },
  ];

  const pacientes: any[] = [];
  for (const h of hospedes) {
    const existing = await prisma.paciente.findFirst({ where: { cpf: h.cpf } });
    if (existing) { pacientes.push(existing); continue; }

    const pac = await prisma.paciente.create({
      data: {
        nome: h.nome, cpf: h.cpf, dataNascimento: new Date(h.nasc), sexo: h.sexo,
        estadoCivil: "CASADO", telefone: h.tel, cidade: h.cidade, uf: "SC",
        dataAdmissao: new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000),
        diasTratamento: h.dias, mensalidadeValor: h.valor, diaVencimento: 5,
        quartoId: quartos[h.quarto].id, status: "ATIVO", tenantId,
      },
    });
    pacientes.push(pac);

    // Set quarto as occupied
    await prisma.quarto.update({ where: { id: quartos[h.quarto].id }, data: { status: "OCUPADO" } });
  }
  console.log(`  ✓ ${pacientes.length} hóspedes com check-in`);

  // ═══ FINANCEIRO ═══
  const now = new Date();
  let finCount = 0;

  // Receitas (diárias)
  for (const pac of pacientes) {
    for (let d = 0; d < (pac.diasTratamento || 3); d++) {
      await prisma.movimentacaoFinanceira.create({
        data: {
          pacienteId: pac.id, tipo: "RECEITA", categoria: "MENSALIDADE",
          descricao: `Diária ${d + 1} - ${uhData[hospedes.findIndex(h => h.cpf === pac.cpf)]?.tipo || "Standard"}`,
          valor: pac.mensalidadeValor || 400,
          dataVencimento: new Date(now.getTime() + d * 86400000),
          status: d < 2 ? "PAGO" : "PENDENTE",
          dataPagamento: d < 2 ? new Date() : null,
          formaPagamento: d < 2 ? "Cartão" : null,
          tenantId,
        },
      });
      finCount++;
    }
  }

  // Despesas operacionais
  const despesas = [
    { cat: "ALIMENTACAO" as const, desc: "Café da manhã — buffet", valor: 3200 },
    { cat: "LAVANDERIA" as const, desc: "Lavanderia hoteleira", valor: 1800 },
    { cat: "OUTRO" as const, desc: "Energia elétrica", valor: 4500 },
    { cat: "OUTRO" as const, desc: "Água", valor: 800 },
    { cat: "OUTRO" as const, desc: "Internet fibra", valor: 600 },
    { cat: "OUTRO" as const, desc: "Manutenção ar-condicionado", valor: 1200 },
    { cat: "OUTRO" as const, desc: "Produtos de limpeza", valor: 900 },
    { cat: "OUTRO" as const, desc: "Amenities quartos", valor: 650 },
  ];
  for (const d of despesas) {
    await prisma.movimentacaoFinanceira.create({
      data: { tipo: "DESPESA", categoria: d.cat, descricao: d.desc, valor: d.valor, dataVencimento: new Date(), status: "PAGO", dataPagamento: new Date(), formaPagamento: "Boleto", tenantId },
    });
    finCount++;
  }
  console.log(`  ✓ ${finCount} movimentações financeiras`);

  // ═══ AGENDAMENTOS (reservas/check-ins futuros) ═══
  const admin = await prisma.user.findFirst({ where: { email: "admin@hotel-demo.com" } });
  const reservas = [
    { nome: "Check-in Sr. Mendes", dias: 1 },
    { nome: "Check-in Família Oliveira", dias: 2 },
    { nome: "Check-out Sra. Lima", dias: 1 },
    { nome: "Reserva Grupo Empresarial", dias: 3 },
    { nome: "Check-in Casal Honeymoon", dias: 4 },
    { nome: "Transfer aeroporto", dias: 1 },
  ];

  for (const r of reservas) {
    const dataHora = new Date(now.getTime() + r.dias * 86400000);
    dataHora.setHours(14, 0, 0, 0);
    await prisma.agendamento.create({
      data: {
        pacienteId: pacientes[Math.floor(Math.random() * pacientes.length)].id,
        profissionalId: admin!.id,
        tipo: r.nome.includes("Check") ? r.nome.split(" ")[0] : "Reserva",
        dataHora,
        duracao: 30,
        status: "AGENDADO",
        observacoes: r.nome,
      },
    });
  }
  console.log(`  ✓ ${reservas.length} reservas/agendamentos`);

  // ═══ ESTOQUE ═══
  const itens = [
    { nome: "Toalha de banho", cat: "ROUPA_CAMA" as const, un: "Un", qty: 80, min: 30 },
    { nome: "Lençol king", cat: "ROUPA_CAMA" as const, un: "Un", qty: 40, min: 15 },
    { nome: "Kit amenities", cat: "HIGIENE" as const, un: "Kit", qty: 120, min: 40 },
    { nome: "Sabonete líquido", cat: "HIGIENE" as const, un: "L", qty: 25, min: 10 },
    { nome: "Papel higiênico", cat: "HIGIENE" as const, un: "Fardo", qty: 15, min: 5 },
    { nome: "Detergente", cat: "LIMPEZA" as const, un: "L", qty: 20, min: 8 },
    { nome: "Desinfetante", cat: "LIMPEZA" as const, un: "L", qty: 15, min: 5 },
    { nome: "Café torrado", cat: "ALIMENTO" as const, un: "Kg", qty: 10, min: 3 },
    { nome: "Açúcar", cat: "ALIMENTO" as const, un: "Kg", qty: 8, min: 3 },
    { nome: "Pão francês (congelado)", cat: "ALIMENTO" as const, un: "Pct", qty: 20, min: 8 },
  ];

  for (const item of itens) {
    await prisma.itemEstoque.create({ data: { nome: item.nome, categoria: item.cat, unidade: item.un, quantidade: item.qty, minimo: item.min, tenantId } });
  }
  console.log(`  ✓ ${itens.length} itens de estoque`);

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Hotel Demo configurado com sucesso!");
  console.log("   Login: admin@hotel-demo.com / Admin@Hotel2026");
  console.log("   Terminologia: Hóspede, UH, Check-in/out, Diárias");
  console.log("   Features: financeiro, agenda, quartos, estoque, CRM, reservas");
  console.log("═══════════════════════════════════════");
}

main().catch((e) => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
