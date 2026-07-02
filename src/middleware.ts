import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/_next", "/images", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check session token
  const token = req.cookies.get("session-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await verifyToken(token);
  if (!session) {
    // Clear invalid cookie and redirect
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
