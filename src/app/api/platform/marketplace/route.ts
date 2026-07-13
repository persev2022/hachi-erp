import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Available modules in the marketplace
const MARKETPLACE_MODULES = [
  {
    id: "crm",
    name: "CRM Pipeline",
    description: "Gestão de leads, oportunidades e funil de vendas",
    category: "Comercial",
    price: 0,
    icon: "Users",
    features: ["Pipeline drag-n-drop", "Lead scoring", "Automação de follow-up"],
  },
  {
    id: "pdv",
    name: "PDV - Ponto de Venda",
    description: "Frente de caixa com controle de vendas e recebimentos",
    category: "Financeiro",
    price: 49,
    icon: "ShoppingCart",
    features: ["Vendas rápidas", "Controle de caixa", "Recibos automáticos"],
  },
  {
    id: "delivery",
    name: "Delivery & Entregas",
    description: "Gestão de pedidos e entregas com rastreamento",
    category: "Operacional",
    price: 79,
    icon: "Truck",
    features: ["Pedidos online", "Rastreamento", "Integração iFood"],
  },
  {
    id: "telemedicina",
    name: "Telemedicina",
    description: "Consultas por vídeo com prontuário integrado",
    category: "Saúde",
    price: 99,
    icon: "Video",
    features: ["Videochamada", "Prescrição digital", "Gravação"],
  },
  {
    id: "rh",
    name: "RH & Folha",
    description: "Gestão de colaboradores, ponto e folha de pagamento",
    category: "RH",
    price: 149,
    icon: "UserCheck",
    features: ["Ponto eletrônico", "Férias/banco horas", "Holerite"],
  },
  {
    id: "bi_avancado",
    name: "BI Avançado",
    description: "Dashboards customizáveis com drill-down e exportação",
    category: "Analytics",
    price: 99,
    icon: "BarChart3",
    features: ["Dashboards custom", "Relatórios agendados", "Exportação PDF"],
  },
  {
    id: "assinatura_eletronica",
    name: "Assinatura Eletrônica",
    description: "Assinatura digital de contratos e documentos com validade jurídica",
    category: "Documentos",
    price: 0,
    icon: "FileSignature",
    features: ["SHA-256", "Lei 14.063/2020", "QR Code de verificação"],
  },
  {
    id: "portal_familia",
    name: "Portal da Família",
    description: "Acesso seguro para familiares acompanharem evolução",
    category: "Comunicação",
    price: 0,
    icon: "Heart",
    features: ["Visualizar evoluções", "Comunicação direta", "Relatórios"],
  },
  {
    id: "integracao_whatsapp",
    name: "WhatsApp Business",
    description: "Comunicação automatizada via WhatsApp com chatbot",
    category: "Comunicação",
    price: 79,
    icon: "MessageSquare",
    features: ["Mensagens automáticas", "Chatbot IA", "Broadcast"],
  },
  {
    id: "contabilidade",
    name: "Contabilidade",
    description: "DRE, Balanço, exportação para contadores",
    category: "Financeiro",
    price: 129,
    icon: "Calculator",
    features: ["DRE automático", "Integração contábil", "Notas fiscais"],
  },
];

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  // Get tenant's installed modules
  let installedModules: string[] = [];
  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { config: true },
    });
    if (tenant?.config && typeof tenant.config === "object") {
      const config = tenant.config as Record<string, unknown>;
      installedModules = (config.installedModules as string[]) || [];
    }
  }

  const modules = MARKETPLACE_MODULES.map((mod) => ({
    ...mod,
    installed: installedModules.includes(mod.id),
  }));

  return NextResponse.json({ success: true, data: { modules, installed: installedModules } });
}

// Install/uninstall a module
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Apenas admins podem instalar módulos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { moduleId, action } = body;

    if (!moduleId || !["install", "uninstall"].includes(action)) {
      return NextResponse.json({ success: false, error: "moduleId e action (install/uninstall) são obrigatórios" }, { status: 400 });
    }

    const validModule = MARKETPLACE_MODULES.find((m) => m.id === moduleId);
    if (!validModule) {
      return NextResponse.json({ success: false, error: "Módulo não encontrado" }, { status: 404 });
    }

    if (!session.tenantId) {
      return NextResponse.json({ success: false, error: "Tenant não identificado" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant não encontrado" }, { status: 404 });
    }

    const config = (typeof tenant.config === "object" && tenant.config !== null ? tenant.config : {}) as Record<string, unknown>;
    let installedModules = (config.installedModules as string[]) || [];

    if (action === "install") {
      if (!installedModules.includes(moduleId)) {
        installedModules.push(moduleId);
      }
    } else {
      installedModules = installedModules.filter((id) => id !== moduleId);
    }

    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        config: { ...config, installedModules },
      },
    });

    return NextResponse.json({
      success: true,
      message: action === "install" ? `${validModule.name} instalado com sucesso` : `${validModule.name} desinstalado`,
      data: { installedModules },
    });
  } catch (error) {
    console.error("Marketplace error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
