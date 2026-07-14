import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// Security: Require NEXTAUTH_SECRET with minimum 32 chars
const secretValue = process.env.NEXTAUTH_SECRET;
if (!secretValue) throw new Error("NEXTAUTH_SECRET environment variable is required");
if (secretValue.length < 32) throw new Error("NEXTAUTH_SECRET must be at least 32 characters");
const SECRET = new TextEncoder().encode(secretValue);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  userId: string;
  role: string;
  tenantId?: string | null;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  // Remove null/undefined values (jose doesn't accept null in payload)
  const cleanPayload: Record<string, unknown> = { userId: payload.userId, role: payload.role };
  if (payload.tenantId) cleanPayload.tenantId = payload.tenantId;

  return new SignJWT(cleanPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Reduced from 7d to 24h for security
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"], // Explicitly restrict accepted algorithms
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  // Try cookie first
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    })
  );
  const tokenFromCookie = cookies["session-token"];

  // Try Authorization header
  const authHeader = req.headers.get("authorization") || "";
  const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return null;

  return verifyToken(token);
}
