import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/relatorios/audit
 * Enterprise Audit Log with filtering, stats, and export support
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "COORDENADOR"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "50"));
    const userId = searchParams.get("userId");
    const entity = searchParams.get("entity");
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const includeStats = searchParams.get("stats") === "true";

    // Build where clause
    const where: any = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (search) {
      where.OR = [
        { entity: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    const total = await prisma.auditLog.count({ where });

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Generate stats if requested
    let stats = null;
    if (includeStats) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [totalAll, todayCount, weekCount, byAction, byEntity, byUser, recentActivity] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({ where: { createdAt: { gte: today } } }),
        prisma.auditLog.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.auditLog.groupBy({ by: ["action"], _count: true, orderBy: { _count: { action: "desc" } } }),
        prisma.auditLog.groupBy({ by: ["entity"], _count: true, orderBy: { _count: { entity: "desc" } }, take: 10 }),
        prisma.$queryRaw`
          SELECT u.name, u.role, COUNT(a.id)::int as count
          FROM audit_logs a JOIN users u ON a."userId" = u.id
          GROUP BY u.name, u.role
          ORDER BY count DESC
          LIMIT 10
        ` as Promise<any[]>,
        // Activity by hour (last 24h)
        prisma.$queryRaw`
          SELECT date_trunc('hour', "createdAt") as hour, COUNT(*)::int as count
          FROM audit_logs
          WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
          GROUP BY hour
          ORDER BY hour
        ` as Promise<any[]>,
      ]);

      stats = {
        totalAll,
        todayCount,
        weekCount,
        avgPerDay: weekCount > 0 ? Math.round(weekCount / 7) : 0,
        byAction: byAction.map(a => ({ action: a.action, count: a._count })),
        byEntity: byEntity.map(e => ({ entity: e.entity, count: e._count })),
        byUser: byUser.map((u: any) => ({ name: u.name, role: u.role, count: u.count })),
        recentActivity: recentActivity.map((r: any) => ({
          hour: r.hour,
          count: r.count,
        })),
      };
    }

    // Get unique entities and users for filters
    const [entities, users] = await Promise.all([
      prisma.auditLog.groupBy({ by: ["entity"], _count: true, orderBy: { _count: { entity: "desc" } } }),
      prisma.user.findMany({
        where: session.tenantId ? { tenantId: session.tenantId } : {},
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      filters: {
        entities: entities.map(e => ({ name: e.entity, count: e._count })),
        users: users,
        actions: ["CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "REACTIVATE", "DISCHARGE", "SIGN"],
      },
      ...(stats ? { stats } : {}),
    });
  } catch (error) {
    console.error("GET /api/relatorios/audit error:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar audit log" }, { status: 500 });
  }
}
