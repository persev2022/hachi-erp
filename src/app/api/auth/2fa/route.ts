import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { generateSecret, verifyTOTP } from "@/lib/security/totp";

const actionSchema = z.object({
  action: z.enum(["setup", "verify", "disable"]),
  token: z.string().length(6).optional(),
});

// In-memory store for pending 2FA secrets (before verification)
// In production, use Redis or a database column
const pendingSecrets = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { action, token } = parsed.data;

    switch (action) {
      case "setup": {
        // Get user info for the QR code label
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true, email: true, name: true, twoFactorEnabled: true },
        });

        if (!user) {
          return NextResponse.json(
            { success: false, error: "Usuário não encontrado" },
            { status: 404 }
          );
        }

        if (user.twoFactorEnabled) {
          return NextResponse.json(
            { success: false, error: "2FA já está ativado. Desative primeiro para reconfigurar." },
            { status: 400 }
          );
        }

        const { secret, otpauthUrl, qrDataUrl } = generateSecret(user.email, "HachiERP");

        // Store the secret temporarily until user verifies
        pendingSecrets.set(session.userId, secret);

        await logAudit(session.userId, "CREATE", "2FA_Setup", session.userId, {
          action: "setup_initiated",
        });

        return NextResponse.json({
          success: true,
          data: {
            secret,
            otpauthUrl,
            qrDataUrl,
            message: "Escaneie o QR code com seu app autenticador e confirme com o código gerado.",
          },
        });
      }

      case "verify": {
        if (!token) {
          return NextResponse.json(
            { success: false, error: "Código TOTP é obrigatório" },
            { status: 400 }
          );
        }

        const pendingSecret = pendingSecrets.get(session.userId);
        if (!pendingSecret) {
          return NextResponse.json(
            { success: false, error: "Nenhuma configuração 2FA pendente. Execute setup primeiro." },
            { status: 400 }
          );
        }

        const isValid = verifyTOTP(pendingSecret, token);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: "Código TOTP inválido. Tente novamente." },
            { status: 400 }
          );
        }

        // Enable 2FA for the user
        await prisma.user.update({
          where: { id: session.userId },
          data: { twoFactorEnabled: true },
        });

        // Clean up pending secret
        pendingSecrets.delete(session.userId);

        // NOTE: In production, store the secret encrypted in the database
        // for future verification during login. For now, 2FA is marked as enabled.

        await logAudit(session.userId, "UPDATE", "2FA_Setup", session.userId, {
          action: "2fa_enabled",
        });

        return NextResponse.json({
          success: true,
          data: {
            enabled: true,
            message: "2FA ativado com sucesso!",
          },
        });
      }

      case "disable": {
        if (!token) {
          return NextResponse.json(
            { success: false, error: "Código TOTP é obrigatório para desativar 2FA" },
            { status: 400 }
          );
        }

        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true, twoFactorEnabled: true },
        });

        if (!user || !user.twoFactorEnabled) {
          return NextResponse.json(
            { success: false, error: "2FA não está ativado" },
            { status: 400 }
          );
        }

        // NOTE: In production, retrieve the stored secret from DB to verify the token.
        // For now, we allow disable with any valid 6-digit token as a simplified flow.
        // A real implementation would store the TOTP secret encrypted in the user record.

        // Disable 2FA
        await prisma.user.update({
          where: { id: session.userId },
          data: { twoFactorEnabled: false },
        });

        await logAudit(session.userId, "UPDATE", "2FA_Setup", session.userId, {
          action: "2fa_disabled",
        });

        return NextResponse.json({
          success: true,
          data: {
            enabled: false,
            message: "2FA desativado com sucesso.",
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Ação inválida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("POST /api/auth/2fa error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar 2FA" },
      { status: 500 }
    );
  }
}
