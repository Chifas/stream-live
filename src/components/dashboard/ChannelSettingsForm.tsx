"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateChannelAction, type FormState } from "@/app/actions/channel";
import type { Channel } from "@/lib/queries";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-2 disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

const field = "w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none focus:border-brand";
const label = "mb-1 block text-sm text-muted";

export function ChannelSettingsForm({ channel }: { channel: Channel }) {
  const [state, action] = useActionState<FormState, FormData>(updateChannelAction, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="title" className={label}>Título del directo</label>
        <input id="title" name="title" defaultValue={channel.title} className={field} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={label}>Categoría</label>
          <input id="category" name="category" defaultValue={channel.category} className={field} />
        </div>
        <div>
          <label htmlFor="language" className={label}>Idioma</label>
          <input id="language" name="language" defaultValue={channel.language} className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="tags" className={label}>Etiquetas (separadas por comas)</label>
        <input id="tags" name="tags" defaultValue={channel.tags.join(", ")} className={field} />
      </div>
      <div>
        <label htmlFor="about" className={label}>Acerca del canal</label>
        <textarea id="about" name="about" defaultValue={channel.about} rows={3} className={field} />
      </div>
      <div className="flex items-center gap-3">
        <Save />
        {state.ok && <span className="text-sm text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-live">{state.error}</span>}
      </div>
    </form>
  );
}
