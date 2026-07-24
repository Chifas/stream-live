"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { addPanelAction, deletePanelAction, type FormState } from "@/app/actions/channel";
import type { Panel } from "@/lib/queries";
import { PencilIcon } from "./icons";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-brand rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

const field = "w-full rounded-md border border-edge bg-ink-3 px-3 py-2 text-sm focus:border-brand";

function AddPanel() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(addPanelAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <PencilIcon className="size-3.5" /> Añadir panel
      </button>
    );
  }

  return (
    <form action={action} className="card space-y-3 p-4">
      <input name="title" placeholder="Título del panel (p. ej. Mis redes)" className={field} />
      <textarea name="body" rows={3} placeholder="Texto del panel (opcional)" className={field} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="imageUrl" placeholder="URL de imagen (opcional)" className={field} />
        <input name="linkUrl" placeholder="Enlace (opcional, https://…)" className={field} />
      </div>
      <div className="flex items-center gap-3">
        <Submit label="Crear panel" />
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-fg">
          Cancelar
        </button>
        {state.error && <span className="text-sm text-live">{state.error}</span>}
      </div>
    </form>
  );
}

function DeletePanel({ id }: { id: string }) {
  const [, action] = useActionState<FormState, FormData>(deletePanelAction, {});
  const router = useRouter();
  return (
    <form
      action={(fd) => {
        action(fd);
        setTimeout(() => router.refresh(), 200);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-xs text-muted transition-colors hover:text-live" aria-label="Borrar panel">
        Borrar
      </button>
    </form>
  );
}

export function Panels({ panels, isOwner }: { panels: Panel[]; isOwner: boolean }) {
  if (panels.length === 0 && !isOwner) return null;

  return (
    <div className="space-y-4">
      {isOwner && <AddPanel />}
      {panels.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {panels.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.title} className="max-h-48 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">{p.title}</h3>
                  {isOwner && <DeletePanel id={p.id} />}
                </div>
                {p.body && (
                  <p className="mt-1.5 whitespace-pre-line text-pretty text-sm text-fg/90">{p.body}</p>
                )}
                {p.linkUrl && (
                  <a
                    href={p.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-md bg-ink-3 px-3 py-1.5 text-xs font-semibold text-brand-2 hover:bg-edge"
                  >
                    Abrir enlace →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
