"use client";

import { useState } from "react";

export function CopyField({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!secret);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-ink-3 px-3 py-2 text-sm text-brand-2">
          {revealed ? value : "•".repeat(Math.min(24, value.length))}
        </code>
        {secret && (
          <button
            onClick={() => setRevealed((v) => !v)}
            className="rounded bg-ink-3 px-2 py-2 text-xs text-muted hover:text-fg"
            aria-label={revealed ? "Ocultar" : "Mostrar"}
          >
            {revealed ? "🙈" : "👁️"}
          </button>
        )}
        <button
          onClick={copy}
          className="rounded bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-2"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
