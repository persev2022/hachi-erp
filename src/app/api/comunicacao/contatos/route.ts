import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  listarSubscribers,
  buscarSubscriberPorTelefone,
  listarTags,
  listarFluxos,
} from "@/lib/integrations/botconversa/client";

/**
 * GET: Fetch contacts (subscribers) directly from BotConversa API.
 * Returns all subscribers with their data (name, phone, tags, etc.)
 * 
 * Query params:
 * - page: page number (default 1)
 * - action: "subscribers" | "tags" | "flows" | "search"
 * - phone: phone to search (when action=search)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    // TENANT ISOLATION: BotConversa is ONLY for the tenant that owns the account
    // Other tenants must NOT see these contacts
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { slug: true } });
      // Only ct-persev has BotConversa configured
      if (tenant?.slug !== "ct-persev") {
        return NextResponse.json({ success: true, data: { results: [], count: 0 } });
      }
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "subscribers";
    const page = parseInt(searchParams.get("page") || "1");

    switch (action) {
      case "subscribers": {
        const data = await listarSubscribers(page);
        return NextResponse.json({ success: true, data });
      }

      case "tags": {
        const data = await listarTags();
        return NextResponse.json({ success: true, data });
      }

      case "flows": {
        const data = await listarFluxos();
        return NextResponse.json({ success: true, data });
      }

      case "search": {
        const phone = searchParams.get("phone");
        if (!phone) {
          return NextResponse.json({ success: false, error: "Phone é obrigatório" }, { status: 400 });
        }
        try {
          const data = await buscarSubscriberPorTelefone(phone);
          return NextResponse.json({ success: true, data });
        } catch (error: any) {
          if (error?.response?.status === 404) {
            return NextResponse.json({ success: true, data: null });
          }
          throw error;
        }
      }

      default:
        return NextResponse.json({ success: false, error: "Ação inválida" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("GET /api/comunicacao/contatos error:", error?.message);
    
    // Handle API key not configured
    if (error?.message?.includes("não configurada")) {
      return NextResponse.json(
        { success: false, error: "BotConversa API não configurada. Vá em Configurações → Integrações." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro ao buscar contatos do BotConversa" },
      { status: 500 }
    );
  }
}
