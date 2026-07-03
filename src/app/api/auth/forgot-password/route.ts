import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

/**
 * POST: Request password reset.
 * Generates a short-lived token and sends email (or returns it for now).
 * Always returns success to prevent email enumeration.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`forgot:${ip}`, { windowMs: 300000, max: 3 });
  if (!rl.allowed) {
    return NextResponse.json({ success: true, message: "Se o email existir, enviaremos instruções." });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: true, message: "Se o email existir, enviaremos instruções." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, active: true },
    });

    // Always return success (prevent enumeration)
    if (!user || !user.active) {
      return NextResponse.json({ success: true, message: "Se o email existir, enviaremos instruções." });
    }

    // Generate a short-lived reset token (15 min)
    const resetToken = await createToken({ userId: user.id, role: "RESET" });

    // Try to send email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const baseUrl = process.env.NEXTAUTH_URL || "https://hachi-erp.vercel.app";
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        await resend.emails.send({
          from: "Hachi ERP <noreply@hachi.med.br>",
          to: user.email,
          subject: "Redefinir senha — Hachi ERP",
          html: `
            <h2>Olá, ${user.name}</h2>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p><a href="${resetUrl}" style="background:#0f766e;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Redefinir Senha</a></p>
            <p style="color:#666;font-size:12px;">Este link expira em 15 minutos. Se você não solicitou, ignore este email.</p>
          `,
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Se o email existir, enviaremos instruções.",
      // In dev/without Resend, expose token for testing
      ...(process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY
        ? { _devToken: resetToken }
        : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: true, message: "Se o email existir, enviaremos instruções." });
  }
}
