import { NextRequest, NextResponse } from "next/server";
import { blacklistToken } from "@/lib/security/token-blacklist";

export async function POST(req: NextRequest) {
  // Get current token and blacklist it
  const token = req.cookies.get("session-token")?.value;
  if (token) {
    blacklistToken(token);
  }

  const response = NextResponse.json({ success: true, message: "Logout realizado" });

  response.cookies.set("session-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
