import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, hashPassword } from "@/lib/auth";
import { validatePassword } from "@/lib/security/password-policy";

/**
 * POST: Reset password using token from forgot-password email.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: "Token e nova senha são obrigatórios" }, { status: 400 });
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "RESET") {
      return NextResponse.json({ success: false, error: "Token inválido ou expirado" }, { status: 401 });
    }

    // Validate password policy
    const policyResult = validatePassword(newPassword);
    if (!policyResult.valid) {
      return NextResponse.json(
        { success: false, error: "Senha não atende a política", details: policyResult.errors },
        { status: 400 }
      );
    }

    // Update password
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true, message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, error: "Erro ao redefinir senha" }, { status: 500 });
  }
}
