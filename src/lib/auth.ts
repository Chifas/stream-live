import { SignJWT, jwtVerify } from "jose";

/**
 * Sesión sin estado basada en JWT firmado (HS256) guardado en una cookie
 * httpOnly. Las funciones puras (sign/verify) sirven tanto para el App Router
 * como para el servidor WebSocket, que lee la cookie del handshake.
 */

export const SESSION_COOKIE = "sl_session";
export type Role = "viewer" | "creator" | "admin";

export interface SessionUser {
  userId: string;
  username: string;
  role: Role;
  color: string;
}

const DEV_SECRET = "dev-insecure-secret-change-me-please-0000000000";

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET ?? DEV_SECRET;
  return new TextEncoder().encode(value);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ username: user.username, role: user.role, color: user.color })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: String(payload.sub),
      username: String(payload.username),
      role: (payload.role as Role) ?? "viewer",
      color: String(payload.color ?? "#a970ff"),
    };
  } catch {
    return null;
  }
}

/** Lee el token de sesión de una cabecera `Cookie` cruda (para el WebSocket). */
export function readSessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === SESSION_COOKIE) return decodeURIComponent(v.join("="));
  }
  return undefined;
}
