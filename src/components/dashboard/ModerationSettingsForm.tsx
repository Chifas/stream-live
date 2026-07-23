"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateModerationAction, type FormState } from "@/app/actions/channel";
import type { Channel } from "@/lib/queries";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-2 disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar moderación"}
    </button>
  );
}

const field = "w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none focus:border-brand";

export function ModerationSettingsForm({ channel }: { channel: Channel }) {
  const [state, action] = useActionState<FormState, FormData>(updateModerationAction, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="slowModeDefault" className="mb-1 block text-sm text-muted">
            Modo lento por defecto (segundos, 0 = desactivado)
          </label>
          <input
            id="slowModeDefault"
            name="slowModeDefault"
            type="number"
            min={0}
            max={300}
            defaultValue={channel.slowModeDefault}
            className={field}
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="followersOnly"
            defaultChecked={channel.followersOnly}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Solo pueden escribir seguidores
        </label>
      </div>
      <div>
        <label htmlFor="bannedWords" className="mb-1 block text-sm text-muted">
          Palabras prohibidas (separadas por comas; se censuran automáticamente)
        </label>
        <input
          id="bannedWords"
          name="bannedWords"
          defaultValue={(channel.bannedWords ?? []).join(", ")}
          placeholder="spam, insulto1, insulto2"
          className={field}
        />
      </div>
      <div className="flex items-center gap-3">
        <Save />
        {state.ok && <span className="text-sm text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-live">{state.error}</span>}
      </div>
    </form>
  );
}
