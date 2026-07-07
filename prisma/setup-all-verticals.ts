import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const VERTICALS = [
  {
    name: "Hachi Senior Demo",
    slug: "senior-demo",
    vertical: "senior",
    plan: "starter",
    password: "Admin@Senior2026",
    email: "admin@senior-demo.com",
    color: "#e11d48",
    features: {
      financeiro: true, agenda: true, documentos: true, estoque: true,
      comunicacao: true, relatorios: true, configuracoes: true,
      prontuario: true, portalFamilia: true, quartos: true, prescricoes: true,
      crm: false, pdv: false, delivery: false, reservas: false,
    },
  },
  {
    name: "Hachi Hotel Demo",
    slug: "hotel-demo",
    vertical: "hotel",
    plan: "starter",
    password: "Admin@Hotel2026",
    email: "admin@hotel-demo.com",
    color: "#9333ea",
    features: {
      financeiro: true, agenda: true, documentos: true, estoque: true,
      comunicacao: true, relatorios: true, configuracoes: true,
      prontuario: false, portalFamilia: false, quartos: true, prescricoes: false,
      crm: true, pdv: false, delivery: false, reservas: true,
    },
  },
  {
    name: "Hachi Restaurant Demo",
    slug: "restaurant-demo",
    vertical: "restaurant",
    plan: "starter",
    password: "Admin@Rest2026",
    email: "admin@restaurant-demo.com",
    color: "#d97706",
    features: {
      financeiro: true, agenda: false, documentos: true, estoque: true,
      comunicacao: true, relatorios: true, configuracoes: true,
      prontuario: false, portalFamilia: false, quartos: false, prescricoes: false,
      crm: true, pdv: true, delivery: true, reservas: false,
    },
  },
  {
    name: "Hachi Education Demo",
    slug: "education-demo",
    vertical: "education",
    plan: "starter",
    password: "Admin@Edu2026",
    email: "admin@education-demo.com",
    color: "#4f46e5",
    features: {
      financeiro: true, agenda: true, documentos: true, estoque: false,
      comunicacao: true, relatorios: true, configuracoes: true,
      prontuario: false, portalFamilia: true, quartos: false, prescricoes: false,
      crm: true, pdv: false, delivery: false, reservas: false,
    },
  },
  {
    name: "Hachi Vet Demo",
    slug: "vet-demo",
    vertical: "vet",
    plan: "starter",
    password: "Admin@Vet2026",
    email: "admin@vet-demo.com",
    color: "#16a34a",
    features: {
      financeiro: true, agenda: true, documentos: true, estoque: true,
      comunicacao: true, relatorios: true, configuracoes: true,
      prontuario: true, portalFamilia: true, quartos: true, prescricoes: true,
      crm: false, pdv: false, delivery: false, reservas: false,
    },
  },
  {
    name: "Hachi Services Demo",
    slug: "services-demo",
    vertical: "services",
    plan: "starter",
    password: "Admin@Svc2026",
    email: "admin@services-demo.com",
    color: "#374151",
    features: {
      financeiro: true, agenda: true, documentos: true, estoque: false,
      comunicacao: true, relatorios: true, configuracoes: true,
      prontuario: false, portalFamilia: false, quartos: false, prescricoes: false,
      crm: true, pdv: false, delivery: false, reservas: false,
    },
  },
];

async function main() {
  console.log("🚀 Setting up ALL Hachi Platform verticals...\n");

  for (const v of VERTICALS) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: v.slug },
      update: {},
      create: {
        name: v.name,
        slug: v.slug,
        vertical: v.vertical,
        plan: v.plan,
        active: true,
        config: {
          features: v.features,
          branding: {
            name: v.name,
            primaryColor: v.color,
            logo: "/images/hachi-logo.png",
          },
        },
      },
    });

    const hashedPassword = await bcrypt.hash(v.password, 12);

    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: { tenantId: tenant.id },
      create: {
        email: v.email,
        password: hashedPassword,
        name: `Admin ${v.name.replace("Hachi ", "").replace(" Demo", "")}`,
        role: "ADMIN",
        tenantId: tenant.id,
        active: true,
      },
    });

    console.log(`  ✓ ${v.name}`);
    console.log(`    Slug: ${v.slug} | Vertical: ${v.vertical}`);
    console.log(`    Login: ${v.email} / ${v.password}`);
    console.log("");
  }

  console.log("═══════════════════════════════════════");
  console.log("✅ Todos os verticals configurados!");
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
