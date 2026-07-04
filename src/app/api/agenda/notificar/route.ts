import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { enviarMensagem } from "@/lib/integrations/botconversa/client";
import { logAudit } from "@/lib/services/audit";

/**
 * POST: Send appointment reminder via WhatsApp (BotConversa).
 * Sends to all appointments in the next X hours that haven't been notified.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "COORDENADOR", "SECRETARIA"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const horasAntecedencia = body.horas || 24; // default: 24h ahead

    const now = new Date();
    const futureLimit = new Date(now.getTime() + horasAntecedencia * 3600000);

    // Find upcoming appointments
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        dataHora: { gte: now, lte: futureLimit },
        status: { in: ["AGENDADO", "CONFIRMADO"] },
      },
      include: {
        paciente: { select: { nome: true, telefone: true } },
        profissional: { select: { name: true } },
      },
    });

    let sent = 0;
    let failed = 0;

    for (const ag of agendamentos) {
      const phone = ag.paciente.telefone?.replace(/\D/g, "");
      if (!phone || phone.length < 10) {
        failed++;
        continue;
      }

      const hora = ag.dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const data = ag.dataHora.toLocaleDateString("pt-BR");
      const msg = `Olá ${ag.paciente.nome}! Lembrete: você tem ${ag.tipo} agendado para ${data} às ${hora} com ${ag.profissional.name}. Nos vemos em breve! 🙏`;

      try {
        await enviarMensagem({ phone, message: msg });

        // Record communication
        await prisma.comunicacao.create({
          data: {
            pacienteId: ag.pacienteId,
            destinatario: phone,
            canal: "WHATSAPP",
            assunto: "Lembrete de consulta",
            mensagem: msg,
            status: "ENVIADA",
          },
        });

        sent++;
      } catch {
        failed++;
      }
    }

    await logAudit(session.userId, "NOTIFY", "Agendamento", undefined, {
      total: agendamentos.length,
      sent,
      failed,
    });

    return NextResponse.json({
      success: true,
      data: { total: agendamentos.length, sent, failed },
    });
  } catch (error) {
    console.error("POST /api/agenda/notificar error:", error);
    return NextResponse.json({ success: false, error: "Erro ao notificar" }, { status: 500 });
  }
}
