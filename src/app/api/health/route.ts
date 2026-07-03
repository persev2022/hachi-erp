import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Health check endpoint for monitoring.
 * Public — no auth required.
 */
export async function GET() {
  const start = Date.now();

  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: { status: "connected", latencyMs: dbLatency },
      version: "0.2.0",
    });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      db: { status: "disconnected", error: "Failed to connect" },
    }, { status: 503 });
  }
}
