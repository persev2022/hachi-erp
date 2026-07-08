import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true, tenantId: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: logs.map((l) => ({
      id: l.id,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      userName: l.user.name,
      userEmail: l.user.email,
      tenantId: l.user.tenantId,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    })),
  });
}
