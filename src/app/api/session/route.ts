import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { getFeatures } from "@/lib/features";

/**
 * GET /api/session
 * Consolidated endpoint that returns all data needed for the sidebar/layout:
 * - User info (name, role, email)
 * - Tenant info (name, vertical, plan)
 * - Feature flags
 * - Terminology
 * - Branding (color, logo)
 * - Unread notification count
 * 
 * Replaces 4 separate calls: /api/auth/me, /api/platform, /api/platform/terminology, /api/platform/branding
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, tenantId: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });
    }

    // Get tenant info
    let tenant: any = null;
    let features: any = getFeatures("recovery");
    let terminology: any = null;
    let branding: any = null;

    if (user.tenantId) {
      const tenantData = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { id: true, name: true, slug: true, vertical: true, plan: true, config: true },
      });

      if (tenantData) {
        tenant = { name: tenantData.name, slug: tenantData.slug, vertical: tenantData.vertical, plan: tenantData.plan };
        features = getFeatures(tenantData.vertical);

        // Extract branding and terminology from config
        const config = (tenantData.config as any) || {};
        if (config.branding) {
          branding = {
            primaryColor: config.branding.primaryColor || null,
            logo: config.branding.logo || null,
          };
        }
        if (config.terminology) {
          terminology = config.terminology;
        }
      }
    }

    // Default terminology based on vertical
    if (!terminology && tenant?.vertical) {
      const termMap: Record<string, any> = {
        recovery: { paciente: "Acolhido", pacientes: "Acolhidos", admissao: "Admissão", diasTratamento: "Dias de Tratamento", evolucao: "Evolução", quartos: "Quartos" },
        senior: { paciente: "Residente", pacientes: "Residentes", admissao: "Entrada", diasTratamento: "Tempo de Estadia", evolucao: "Evolução", quartos: "Quartos" },
        hotel: { paciente: "Hóspede", pacientes: "Hóspedes", admissao: "Check-in", diasTratamento: "Diárias", evolucao: "Registro", quartos: "UHs" },
        clinic: { paciente: "Paciente", pacientes: "Pacientes", admissao: "Admissão", diasTratamento: "Dias", evolucao: "Evolução", quartos: "Consultórios" },
        vet: { paciente: "Animal", pacientes: "Animais", admissao: "Internação", diasTratamento: "Dias", evolucao: "Prontuário", quartos: "Baias" },
        education: { paciente: "Aluno", pacientes: "Alunos", admissao: "Matrícula", diasTratamento: "Período", evolucao: "Boletim", quartos: "Salas" },
        services: { paciente: "Cliente", pacientes: "Clientes", admissao: "Contrato", diasTratamento: "Prazo", evolucao: "Relatório", quartos: "Salas" },
        restaurant: { paciente: "Cliente", pacientes: "Clientes", admissao: "Cadastro", diasTratamento: "N/A", evolucao: "N/A", quartos: "Mesas" },
      };
      terminology = termMap[tenant.vertical] || termMap.recovery;
    }

    // Unread notifications count
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        tenant,
        features,
        terminology: terminology || { paciente: "Paciente", pacientes: "Pacientes", admissao: "Admissão", diasTratamento: "Dias", evolucao: "Evolução", quartos: "Quartos" },
        branding: branding || { primaryColor: null, logo: null },
        unreadCount,
      },
    });
  } catch (error) {
    console.error("GET /api/session error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
