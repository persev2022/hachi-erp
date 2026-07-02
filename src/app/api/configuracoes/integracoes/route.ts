import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

interface IntegracaoSettings {
  botconversa: { apiKey: string };
  pix: {
    clientId: string;
    clientSecret: string;
    certificateBase64: string;
    pixKey: string;
    environment: "sandbox" | "production";
  };
  nfe: {
    apiKey: string;
    companyId: string;
    environment: "sandbox" | "production";
  };
}

const DEFAULT_SETTINGS: IntegracaoSettings = {
  botconversa: { apiKey: "" },
  pix: { clientId: "", clientSecret: "", certificateBase64: "", pixKey: "", environment: "sandbox" },
  nfe: { apiKey: "", companyId: "", environment: "sandbox" },
};

async function readSettings(): Promise<IntegracaoSettings> {
  const row = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
  if (!row) return DEFAULT_SETTINGS;
  try { return JSON.parse(row.value); } catch { return DEFAULT_SETTINGS; }
}

async function saveSettings(settings: IntegracaoSettings): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key: "integracoes" },
    update: { value: JSON.stringify(settings) },
    create: { key: "integracoes", value: JSON.stringify(settings) },
  });
}

function maskValue(value: string): string {
  if (!value || value.length <= 4) return value ? "****" : "";
  return `****...${value.slice(-4)}`;
}

function maskSettings(settings: IntegracaoSettings) {
  return {
    botconversa: {
      apiKey: maskValue(settings.botconversa.apiKey),
      configured: !!settings.botconversa.apiKey,
    },
    pix: {
      clientId: maskValue(settings.pix.clientId),
      clientSecret: maskValue(settings.pix.clientSecret),
      certificateBase64: settings.pix.certificateBase64 ? "****...(certificado)" : "",
      pixKey: maskValue(settings.pix.pixKey),
      environment: settings.pix.environment,
      configured: !!(settings.pix.clientId && settings.pix.clientSecret),
    },
    nfe: {
      apiKey: maskValue(settings.nfe.apiKey),
      companyId: maskValue(settings.nfe.companyId),
      environment: settings.nfe.environment,
      configured: !!(settings.nfe.apiKey && settings.nfe.companyId),
    },
  };
}

function applyEnvVars(settings: IntegracaoSettings) {
  if (settings.botconversa.apiKey) process.env.BOTCONVERSA_API_KEY = settings.botconversa.apiKey;
  if (settings.pix.clientId) process.env.PIX_CLIENT_ID = settings.pix.clientId;
  if (settings.pix.clientSecret) process.env.PIX_CLIENT_SECRET = settings.pix.clientSecret;
  if (settings.pix.certificateBase64) process.env.PIX_CERTIFICATE = settings.pix.certificateBase64;
  if (settings.pix.pixKey) process.env.PIX_CHAVE = settings.pix.pixKey;
  if (settings.pix.environment) {
    process.env.PIX_BASE_URL = settings.pix.environment === "production"
      ? "https://pix.api.efipay.com.br" : "https://pix-h.api.efipay.com.br";
  }
  if (settings.nfe.apiKey) process.env.NFE_API_KEY = settings.nfe.apiKey;
  if (settings.nfe.companyId) process.env.NFE_COMPANY_ID = settings.nfe.companyId;
  if (settings.nfe.environment) {
    process.env.NFE_BASE_URL = settings.nfe.environment === "production"
      ? "https://api.nfe.io" : "https://api.sandbox.nfe.io";
  }
}

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const settings = await readSettings();
  // Apply env vars on read (ensures they're set after serverless cold start)
  applyEnvVars(settings);
  return NextResponse.json(maskSettings(settings));
}

export async function PUT(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { integration, data } = body as {
      integration: "botconversa" | "pix" | "nfe";
      data: Record<string, string>;
    };

    if (!integration || !data) {
      return NextResponse.json({ error: "integration e data são obrigatórios" }, { status: 400 });
    }

    const settings = await readSettings();

    if (integration === "botconversa") {
      if (data.apiKey && !data.apiKey.startsWith("****")) settings.botconversa.apiKey = data.apiKey;
    } else if (integration === "pix") {
      if (data.clientId && !data.clientId.startsWith("****")) settings.pix.clientId = data.clientId;
      if (data.clientSecret && !data.clientSecret.startsWith("****")) settings.pix.clientSecret = data.clientSecret;
      if (data.certificateBase64 && !data.certificateBase64.startsWith("****")) settings.pix.certificateBase64 = data.certificateBase64;
      if (data.pixKey && !data.pixKey.startsWith("****")) settings.pix.pixKey = data.pixKey;
      if (data.environment) settings.pix.environment = data.environment as "sandbox" | "production";
    } else if (integration === "nfe") {
      if (data.apiKey && !data.apiKey.startsWith("****")) settings.nfe.apiKey = data.apiKey;
      if (data.companyId && !data.companyId.startsWith("****")) settings.nfe.companyId = data.companyId;
      if (data.environment) settings.nfe.environment = data.environment as "sandbox" | "production";
    } else {
      return NextResponse.json({ error: "Integração inválida" }, { status: 400 });
    }

    await saveSettings(settings);
    applyEnvVars(settings);

    await logAudit(session.userId, "UPDATE", "IntegrationSettings", integration, {
      integration,
      fieldsUpdated: Object.keys(data),
    });

    return NextResponse.json({ success: true, message: `Configurações de ${integration} salvas` });
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
