import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

/**
 * GET: List uploaded custom templates
 * POST: Upload a new .docx template (stored as base64 in SystemConfig)
 */

interface Template {
  id: string;
  name: string;
  tipo: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
}

async function getTemplates(): Promise<Template[]> {
  const config = await prisma.systemConfig.findUnique({ where: { key: "custom_templates" } });
  if (!config) return [];
  try { return JSON.parse(config.value); } catch { return []; }
}

async function saveTemplates(templates: Template[]): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key: "custom_templates" },
    update: { value: JSON.stringify(templates) },
    create: { key: "custom_templates", value: JSON.stringify(templates) },
  });
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

  const templates = await getTemplates();
  return NextResponse.json({ success: true, data: templates });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const tipo = formData.get("tipo") as string || "OUTRO";
    const name = formData.get("name") as string || file?.name || "template";

    if (!file) {
      return NextResponse.json({ success: false, error: "Arquivo é obrigatório" }, { status: 400 });
    }

    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ success: false, error: "Apenas arquivos .docx são aceitos" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
    }

    // Convert to base64 and store
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Store template content in separate key
    const templateId = `tpl-${Date.now()}`;
    await prisma.systemConfig.upsert({
      where: { key: `template_${templateId}` },
      update: { value: base64 },
      create: { key: `template_${templateId}`, value: base64 },
    });

    // Add to template list
    const templates = await getTemplates();
    templates.push({
      id: templateId,
      name,
      tipo,
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.userId,
      size: file.size,
    });
    await saveTemplates(templates);

    await logAudit(session.userId, "UPLOAD", "Template", templateId, { name, tipo, size: file.size });

    return NextResponse.json({ success: true, data: { id: templateId, name } }, { status: 201 });
  } catch (error) {
    console.error("Template upload error:", error);
    return NextResponse.json({ success: false, error: "Erro ao fazer upload" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "ID obrigatório" }, { status: 400 });

  // Remove from list
  const templates = await getTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  await saveTemplates(filtered);

  // Remove content
  await prisma.systemConfig.delete({ where: { key: `template_${id}` } }).catch(() => {});

  await logAudit(session.userId, "DELETE", "Template", id, {});
  return NextResponse.json({ success: true });
}
