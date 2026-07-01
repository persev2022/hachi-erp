import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de autenticação e RBAC do Hachi ERP.
 *
 * Regras de acesso:
 * - /dashboard/* → Todos os usuários autenticados
 * - /clinico/* → MEDICO, PSICOLOGO, ENFERMEIRO, TERAPEUTA
 * - /admin/* → ADMIN apenas
 * - /financeiro/* → ADMIN, FINANCEIRO
 * - /portal-familia/* → Token específico de familiar (não User)
 * - /api/* → Verificação via session token
 */

// Rotas públicas que não exigem autenticação
const PUBLIC_ROUTES = ["/login", "/register", "/api/auth"];

// Mapeamento de rotas para roles permitidos
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/configuracoes": ["ADMIN"],
  "/financeiro": ["ADMIN", "FINANCEIRO"],
  "/prontuario": ["ADMIN", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA"],
  "/prescricoes": ["ADMIN", "MEDICO"],
};

export function middleware(request: NextRequest) {
  // TODO: Reativar auth quando login estiver implementado
  // Por agora, permite acesso livre para desenvolvimento/visualização
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
