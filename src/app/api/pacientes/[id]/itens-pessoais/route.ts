import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ITENS_DIR = join(process.cwd(), "data", "itens-pessoais");

interface ItemPessoal {
  id: string;
  descricao: string;
  quantidade: number;
  estado: "bom" | "regular" | "ruim";
  dataEntrada: string;
  dataDevolucao?: string;
  observacoes?: string;
}

async function readItens(pacienteId: string): Promise<ItemPessoal[]> {
  try {
    const content = await readFile(join(ITENS_DIR, `${pacienteId}.json`), "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeItens(pacienteId: string, itens: ItemPessoal[]): Promise<void> {
  await mkdir(ITENS_DIR, { recursive: true });
  await writeFile(join(ITENS_DIR, `${pacienteId}.json`), JSON.stringify(itens, null, 2), "utf-8");
}

const itemSchema = z.object({
  descricao: z.string().min(1),
  quantidade: z.number().int().min(1).default(1),
  estado: z.enum(["bom", "regular", "ruim"]).default("bom"),
  observacoes: z.string().optional(),
});

// GET: List patient's personal items
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const itens = await readItens(id);

    return NextResponse.json({ success: true, data: itens });
  } catch (error) {
    console.error("GET /api/pacientes/[id]/itens-pessoais error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}

// POST: Add personal item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!paciente) {
      return NextResponse.json({ success: false, error: "Paciente não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = itemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const itens = await readItens(id);
    const newItem: ItemPessoal = {
      id: crypto.randomUUID(),
      descricao: parsed.data.descricao,
      quantidade: parsed.data.quantidade,
      estado: parsed.data.estado,
      dataEntrada: new Date().toISOString(),
      observacoes: parsed.data.observacoes,
    };

    itens.push(newItem);
    await writeItens(id, itens);

    await logAudit(session.userId, "CREATE", "ItemPessoal", newItem.id, {
      pacienteId: id,
      descricao: parsed.data.descricao,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pacientes/[id]/itens-pessoais error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
