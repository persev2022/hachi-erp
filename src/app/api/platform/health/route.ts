import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Platform health (super-admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    // Database connectivity check
    let dbStatus = "connected";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "disconnected";
    }

    // Tenant counts
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { active: true } });

    // Total users across all tenants
    const totalUsers = await prisma.user.count();

    // Memory usage
    const mem = process.memoryUsage();
    const memoryUsage = {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024),
    };

    return NextResponse.json({
      success: true,
      data: {
        status: dbStatus === "connected" ? "healthy" : "degraded",
        database: dbStatus,
        tenants: {
          total: totalTenants,
          active: activeTenants,
        },
        users: {
          total: totalUsers,
        },
        uptime: Math.round(process.uptime()),
        memory: memoryUsage,
        version: "0.2.0",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/platform/health error:", error);
    return NextResponse.json(
      {
        success: false,
        data: {
          status: "error",
          database: "unknown",
          tenants: { total: 0, active: 0 },
          users: { total: 0 },
          uptime: Math.round(process.uptime()),
          memory: { heapUsed: 0, heapTotal: 0, rss: 0 },
          version: "0.2.0",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
