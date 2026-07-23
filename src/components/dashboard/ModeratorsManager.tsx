"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addModAction, removeModAction, type FormState } from "@/app/actions/channel";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-2 disabled:opacity-50"
    >
      {pending ? "…" : "Añadir"}
    </button>
  );
}

export function ModeratorsManager({ moderators }: { moderators: string[] }) {
  const [addState, add] = useActionState<FormState, FormData>(addModAction, {});
  const [, remove] = useActionState<FormState, FormData>(removeModAction, {});

  return (
    <div className="space-y-4">
      <form action={add} className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="modUser" className="mb-1 block text-sm text-muted">
            Nombrar moderador (nombre de usuario registrado)
          </label>
          <input
            id="modUser"
            name="username"
            placeholder="espectador"
            className="w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <AddButton />
      </form>
      {addState.error && <p className="text-sm text-live">{addState.error}</p>}

      {moderators.length > 0 ? (
        <ul className="divide-y divide-edge rounded-md border border-edge">
          {moderators.map((m) => (
            <li key={m} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="rounded bg-green-600 px-1 py-0.5 text-[10px] font-bold text-white">MOD</span>
                {m}
              </span>
              <form action={remove}>
                <input type="hidden" name="username" value={m} />
                <button className="text-xs text-muted transition hover:text-live">Quitar</button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Todavía no hay moderadores.</p>
      )}
    </div>
  );
}
