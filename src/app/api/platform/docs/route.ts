import { NextResponse } from "next/server";

/**
 * GET /api/platform/docs
 * Returns API documentation (OpenAPI-lite format).
 * Public endpoint for developers/integrators.
 */
export async function GET() {
  return NextResponse.json({
    name: "Hachi Platform API",
    version: "0.2.0",
    description: "Business Operating System — API Documentation",
    baseUrl: "https://hachi-erp.vercel.app/api",
    authentication: {
      type: "cookie",
      cookie: "session-token",
      description: "Authenticate via POST /api/auth/login. Token is set as httpOnly cookie.",
    },
    endpoints: {
      auth: {
        "POST /api/auth/login": { description: "Login with email/password", public: true },
        "POST /api/auth/logout": { description: "Logout and invalidate session" },
        "GET /api/auth/me": { description: "Get current user info" },
      },
      platform: {
        "GET /api/platform": { description: "Get tenant info and feature flags" },
        "GET /api/platform/health": { description: "Platform health status", roles: ["ADMIN"] },
        "GET /api/platform/tenants": { description: "List all tenants", roles: ["ADMIN"] },
        "POST /api/platform/tenants": { description: "Create a new tenant", roles: ["ADMIN"] },
        "GET /api/platform/tenants/:id": { description: "Get tenant detail", roles: ["ADMIN"] },
        "PUT /api/platform/tenants/:id": { description: "Update tenant", roles: ["ADMIN"] },
        "POST /api/platform/tenants/:id/users": { description: "Create user in tenant", roles: ["ADMIN"] },
        "POST /api/platform/tenants/:id/invite": { description: "Generate invite for tenant", roles: ["ADMIN"] },
      },
      pacientes: {
        "GET /api/pacientes": { description: "List patients (paginated, filterable)" },
        "POST /api/pacientes": { description: "Create a patient" },
        "GET /api/pacientes/:id": { description: "Get patient detail" },
        "PUT /api/pacientes/:id": { description: "Update patient" },
        "DELETE /api/pacientes/:id": { description: "Soft delete patient" },
        "GET /api/pacientes/:id/exportar": { description: "Export patient data (LGPD)" },
      },
      prontuario: {
        "GET /api/prontuario/evolucoes": { description: "List evolutions", params: ["pacienteId"] },
        "POST /api/prontuario/evolucoes": { description: "Create evolution" },
        "GET /api/prontuario/prescricoes": { description: "List prescriptions", params: ["pacienteId"] },
        "POST /api/prontuario/prescricoes": { description: "Create prescription" },
      },
      agenda: {
        "GET /api/agenda": { description: "List appointments (filterable by date, professional)" },
        "POST /api/agenda": { description: "Create appointment" },
        "PUT /api/agenda/:id": { description: "Update appointment status" },
      },
      financeiro: {
        "GET /api/financeiro": { description: "List financial movements", roles: ["ADMIN", "FINANCEIRO"] },
        "POST /api/financeiro": { description: "Create financial movement" },
        "GET /api/financeiro/conta-corrente/:pacienteId": { description: "Patient account statement" },
      },
      quartos: {
        "GET /api/quartos": { description: "List rooms with occupancy" },
        "POST /api/quartos/transferir": { description: "Transfer patient between rooms" },
      },
      documentos: {
        "GET /api/documentos": { description: "List documents", params: ["pacienteId"] },
        "POST /api/documentos/gerar": { description: "Generate document (contract, receipt, prescription)" },
      },
      comunicacao: {
        "POST /api/comunicacao/enviar": { description: "Send WhatsApp message via BotConversa" },
      },
      relatorios: {
        "GET /api/relatorios/dashboard": { description: "Dashboard KPIs" },
        "GET /api/relatorios/ocupacao": { description: "Occupancy report" },
        "GET /api/relatorios/financeiro": { description: "Financial report" },
        "GET /api/relatorios/clinico": { description: "Clinical adherence report" },
      },
      integracoes: {
        "POST /api/integracoes/pix/cobranca": { description: "Create Pix charge" },
        "POST /api/integracoes/nfe/emitir": { description: "Issue NFS-e" },
        "POST /api/integracoes/botconversa/webhook": { description: "BotConversa webhook (inbound)", public: true },
      },
    },
    webhookEvents: [
      "patient.created",
      "patient.updated",
      "payment.received",
      "appointment.created",
      "document.generated",
      "automation.executed",
    ],
    verticals: ["recovery", "clinic", "senior", "hotel", "restaurant", "education", "vet", "services"],
  });
}
