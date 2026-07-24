"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateProfileAction, type FormState } from "@/app/actions/channel";
import { PencilIcon } from "./icons";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-brand rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

/**
 * Botón de edición (solo se renderiza para el dueño) que despliega un formulario
 * para editar la descripción y el tráiler del canal.
 */
export function ChannelProfileEditor({
  initialBio,
  initialTrailer,
  label = "Editar",
}: {
  initialBio: string;
  initialTrailer: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state.ok, router]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-ink-3 px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-fg"
      >
        <PencilIcon className="size-3.5" /> {label}
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-3 rounded-lg border border-edge bg-ink p-4">
      <div>
        <label htmlFor="trailerUrl" className="mb-1 block text-sm text-muted">
          URL del tráiler (mp4 o .m3u8)
        </label>
        <input
          id="trailerUrl"
          name="trailerUrl"
          defaultValue={initialTrailer}
          placeholder="https://…/intro.mp4"
          className="w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="bio" className="mb-1 block text-sm text-muted">
          Descripción del canal
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initialBio}
          rows={5}
          placeholder="Cuenta de qué va tu canal, horarios, redes…"
          className="w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm focus:border-brand"
        />
      </div>
      <div className="flex items-center gap-3">
        <Save />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-sm text-muted hover:text-fg"
        >
          Cancelar
        </button>
        {state.error && <span className="text-sm text-live">{state.error}</span>}
      </div>
    </form>
  );
}
