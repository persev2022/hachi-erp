import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cron-like endpoint to check upcoming appointments and send push notifications
// Should be called every 15 minutes by a cron job (e.g., Vercel Cron)
export async function GET(req: NextRequest) {
  // Verify cron secret (prevent unauthorized access)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyMinLater = new Date(now.getTime() + 30 * 60 * 1000);
    const fifteenMinLater = new Date(now.getTime() + 15 * 60 * 1000);

    // Find appointments in the next 15-30 minutes that haven't been notified
    const upcomingAppointments = await prisma.agendamento.findMany({
      where: {
        dataHora: {
          gte: fifteenMinLater,
          lte: thirtyMinLater,
        },
        status: "AGENDADO",
      },
      include: {
        paciente: { select: { nome: true } },
        profissional: { select: { name: true } },
      },
    });

    const notifications: { userId: string; title: string; body: string }[] = [];

    for (const apt of upcomingAppointments) {
      if (apt.profissionalId) {
        notifications.push({
          userId: apt.profissionalId,
          title: "Agendamento em 30 minutos",
          body: `${apt.tipo} com ${apt.paciente?.nome || "paciente"} às ${new Date(apt.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        });
      }
    }

    // Store notifications for in-app delivery
    for (const notif of notifications) {
      await prisma.systemConfig.create({
        data: {
          key: `notif_agenda_${notif.userId}_${Date.now()}`,
          value: JSON.stringify({
            title: notif.title,
            body: notif.body,
            type: "agenda_reminder",
            userId: notif.userId,
            createdAt: new Date().toISOString(),
            read: false,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      checked: upcomingAppointments.length,
      notified: notifications.length,
    });
  } catch (error) {
    console.error("Agenda check error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
