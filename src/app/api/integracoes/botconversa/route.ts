import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { enviarMensagem, dispararFluxo } from "@/lib/integrations/botconversa/client";

const sendMessageSchema = z.object({
  pacienteId: z.string().uuid().optional(),
  destinatario: z.string().min(10, "Telefone inválido"),
  mensagem: z.string().min(1, "Mensagem é obrigatória"),
});

const sendFlowSchema = z.object({
  pacienteId: z.string().uuid().optional(),
  destinatario: z.string().min(10, "Telefone inválido"),
  flowId: z.string().min(1, "ID do fluxo é obrigatório"),
  variables: z.record(z.string()).optional(),
});

// POST: Send message or flow
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action;

    if (action === "enviar-mensagem") {
      const parsed = sendMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      // Clean phone number
      const phone = parsed.data.destinatario.replace(/\D/g, "");

      let botconversaResponse;
      try {
        botconversaResponse = await enviarMensagem({
          phone,
          message: parsed.data.mensagem,
        });
      } catch (err: any) {
        console.error("BotConversa enviar error:", err?.response?.data || err.message);
        // Save as failed
        await prisma.comunicacao.create({
          data: {
            pacienteId: parsed.data.pacienteId || null,
            destinatario: phone,
            canal: "WHATSAPP",
            mensagem: parsed.data.mensagem,
            status: "FALHA",
          },
        });
        return NextResponse.json(
          { success: false, error: "Falha ao enviar via BotConversa. Mensagem salva como falha." },
          { status: 502 }
        );
      }

      // Save communication record
      const comunicacao = await prisma.comunicacao.create({
        data: {
          pacienteId: parsed.data.pacienteId || null,
          destinatario: phone,
          canal: "WHATSAPP",
          mensagem: parsed.data.mensagem,
          status: "ENVIADA",
          botconversaId: botconversaResponse?.id || null,
        },
      });

      await logAudit(session.userId, "SEND", "Comunicacao", comunicacao.id, {
        canal: "WHATSAPP",
        destinatario: phone,
      });

      return NextResponse.json({ success: true, data: comunicacao }, { status: 201 });
    }

    if (action === "enviar-fluxo") {
      const parsed = sendFlowSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const phone = parsed.data.destinatario.replace(/\D/g, "");

      try {
        await dispararFluxo({
          phone,
          flowId: parsed.data.flowId,
          variables: parsed.data.variables,
        });
      } catch (err: any) {
        console.error("BotConversa fluxo error:", err?.response?.data || err.message);
        return NextResponse.json(
          { success: false, error: "Falha ao disparar fluxo" },
          { status: 502 }
        );
      }

      const comunicacao = await prisma.comunicacao.create({
        data: {
          pacienteId: parsed.data.pacienteId || null,
          destinatario: phone,
          canal: "WHATSAPP",
          mensagem: `[Fluxo: ${parsed.data.flowId}]`,
          status: "ENVIADA",
        },
      });

      await logAudit(session.userId, "SEND_FLOW", "Comunicacao", comunicacao.id, {
        flowId: parsed.data.flowId,
      });

      return NextResponse.json({ success: true, data: comunicacao }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/integracoes/botconversa error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

// GET: List communication history
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");

    const where: any = { canal: "WHATSAPP" };
    if (pacienteId) where.pacienteId = pacienteId;

    const comunicacoes = await prisma.comunicacao.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: comunicacoes });
  } catch (error) {
    console.error("GET /api/integracoes/botconversa error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
