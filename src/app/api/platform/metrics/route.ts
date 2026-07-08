import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
  }

  if (!session.tenantId) {
    return NextResponse.json({ success: false, error: "Sem tenant" }, { status: 400 });
  }

  const tenantId = session.tenantId;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [patients, users, financialThisMonth, communications, tenant] = await Promise.all([
    prisma.paciente.count({ where: { tenantId, deletedAt: null } }),
    prisma.user.count({ where: { tenantId, active: true } }),
    prisma.movimentacaoFinanceira.count({ where: { tenantId, createdAt: { gte: firstOfMonth } } }),
    prisma.comunicacao.count({ where: { tenantId } }),
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { createdAt: true } }),
  ]);

  // Documents don't have tenantId directly — filter via paciente relation
  const patientIds = await prisma.paciente.findMany({ where: { tenantId }, select: { id: true } });
  const documents = await prisma.documento.count({
    where: { pacienteId: { in: patientIds.map((p) => p.id) } },
  });

  // Last audit log from any user in this tenant
  const tenantUsers = await prisma.user.findMany({ where: { tenantId }, select: { id: true } });
  const lastAudit = await prisma.auditLog.findFirst({
    where: { userId: { in: tenantUsers.map((u) => u.id) } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, action: true },
  });

  const activeDays = tenant
    ? Math.floor((now.getTime() - new Date(tenant.createdAt).getTime()) / 86400000)
    : 0;

  return NextResponse.json({
    success: true,
    metrics: {
      patients,
      users,
      financialThisMonth,
      documents,
      communications,
      activeDays,
      lastActivity: lastAudit?.createdAt || null,
      lastAction: lastAudit?.action || null,
    },
  });
}
