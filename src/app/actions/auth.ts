"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/password";
import { getUserByUsername, createUser } from "@/lib/users";
import { setSession, clearSession } from "@/lib/session";

export interface AuthState {
  error?: string;
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Rellena usuario y contraseña." };

  const user = await getUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Usuario o contraseña incorrectos." };
  }
  await setSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    color: user.color,
  });
  redirect("/");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!USERNAME_RE.test(username)) {
    return { error: "El usuario debe tener 3–24 caracteres (letras, números o _)." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (await getUserByUsername(username)) {
    return { error: "Ese nombre de usuario ya está en uso." };
  }

  const user = await createUser(username, password);
  await setSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    color: user.color,
  });
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/");
}
