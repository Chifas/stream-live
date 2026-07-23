import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, signSession, verifySession, type SessionUser } from "./auth";

/** Helpers de sesión ligados a las cookies de la petición (solo App Router). */

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function setSession(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
