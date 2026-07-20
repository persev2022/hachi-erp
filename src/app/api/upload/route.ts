import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

// Max file size: 2MB
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".php", ".js", ".html", ".htm", ".svg", ".vbs", ".ps1", ".msi", ".dll"];

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const context = formData.get("context") as string | null; // "avatar" | "patient" | "logo"

    if (!file) {
      return NextResponse.json({ success: false, error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Tipo não permitido. Use JPEG, PNG ou WebP." }, { status: 400 });
    }

    // Block dangerous file extensions regardless of MIME type
    const fileName = file.name.toLowerCase();
    if (BLOCKED_EXTENSIONS.some(ext => fileName.includes(ext))) {
      return NextResponse.json({ success: false, error: "Extensão de arquivo não permitida." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "Arquivo muito grande. Máximo 2MB." }, { status: 400 });
    }

    // Convert to base64 data URL for storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        context: context || "general",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Erro ao processar upload" }, { status: 500 });
  }
}
