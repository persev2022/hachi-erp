import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { isTokenBlacklisted } from "@/lib/security/token-blacklist";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/portal-familia",
  "/api/portal-familia",
  "/api/auth/login",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/health",
  "/api/integracoes/botconversa/webhook",
  "/api/integracoes/pix/webhook",
  "/_next",
  "/images",
  "/favicon.ico",
];

// CORS allowlist — add your production domain
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://hachi-erp.vercel.app",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- CORS for API routes ---
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin") || "";
    const isAllowed = !origin || ALLOWED_ORIGINS.includes(origin);

    // Handle preflight
    if (req.method === "OPTIONS") {
      const res = new NextResponse(null, { status: 204 });
      if (isAllowed && origin) {
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.headers.set("Access-Control-Allow-Credentials", "true");
        res.headers.set("Access-Control-Max-Age", "86400");
      }
      return res;
    }

    // Block requests from non-allowed origins (only if origin header is present)
    if (origin && !isAllowed) {
      return NextResponse.json(
        { success: false, error: "Origem não permitida" },
        { status: 403 }
      );
    }

    // Global API rate limit: 120 requests per minute per IP
    const ip = getClientIp(req);
    const rl = checkRateLimit(`api:${ip}`, { windowMs: 60_000, max: 120 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Limite de requisições excedido" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    const response = NextResponse.next();
    // Add CORS header for allowed API origins
    if (pathname.startsWith("/api/")) {
      const origin = req.headers.get("origin") || "";
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }
    }
    return response;
  }

  // Check session token (from cookie ONLY — never from URL)
  const token = req.cookies.get("session-token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if token was blacklisted (logout)
  if (isTokenBlacklisted(token)) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: "Sessão expirada" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session-token");
    return response;
  }

  const session = await verifyToken(token);
  if (!session) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session-token");
    return response;
  }

  // ─── Route-level role protection (frontend pages) ───────────
  if (!pathname.startsWith("/api/")) {
    const role = session.role || "APOIO";
    const routeRoles: Record<string, string[]> = {
      "/financeiro": ["ADMIN", "COORDENADOR", "FINANCEIRO"],
      "/prontuario": ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA"],
      "/pacientes": ["ADMIN", "COORDENADOR", "MEDICO", "PSICOLOGO", "ENFERMEIRO", "TERAPEUTA", "SECRETARIA"],
      "/documentos": ["ADMIN", "COORDENADOR", "MEDICO", "SECRETARIA", "FINANCEIRO"],
      "/comunicacao": ["ADMIN", "COORDENADOR", "SECRETARIA"],
      "/relatorios": ["ADMIN", "COORDENADOR", "FINANCEIRO"],
      "/configuracoes": ["ADMIN"],
      "/quartos": ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "SECRETARIA"],
      "/estoque": ["ADMIN", "COORDENADOR", "ENFERMEIRO", "MONITOR", "APOIO"],
    };

    for (const [route, allowedRoles] of Object.entries(routeRoles)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        if (!allowedRoles.includes(role)) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        break;
      }
    }
  }

  // Pass through with CORS headers for API
  const response = NextResponse.next();
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin") || "";
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
