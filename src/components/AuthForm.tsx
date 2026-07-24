"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-brand w-full rounded-md py-2.5 font-semibold disabled:opacity-50"
    >
      {pending ? "Un momento…" : label}
    </button>
  );
}

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  return (
    <div className="rounded-xl2 border border-edge bg-ink-2 p-6">
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-ink-3 p-1">
        <button
          onClick={() => setMode("login")}
          className={`rounded-md py-1.5 text-sm font-semibold transition ${
            mode === "login" ? "bg-brand text-white" : "text-muted hover:text-white"
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => setMode("register")}
          className={`rounded-md py-1.5 text-sm font-semibold transition ${
            mode === "register" ? "bg-brand text-white" : "text-muted hover:text-white"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form action={formAction} className="space-y-3">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm text-muted">
            Usuario
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            className="w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-muted">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        {state.error && (
          <p role="alert" className="rounded-md bg-live/15 px-3 py-2 text-sm text-live">
            {state.error}
          </p>
        )}
        <SubmitButton label={mode === "login" ? "Entrar" : "Crear cuenta"} />
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        Además puedes iniciar sesión con OAuth (Google/Discord/Twitch) integrando
        Auth.js — ver <code className="text-brand-2">MEJORAS.md</code>.
      </p>
    </div>
  );
}
