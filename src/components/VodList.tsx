"use client";

import { useState } from "react";
import type { Recording } from "@/lib/mediamtx";
import { Player } from "./Player";

function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m} min ${sec}s` : `${sec}s`;
}
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("es-ES");
}

export function VodList({ recordings }: { recordings: Recording[] }) {
  const [current, setCurrent] = useState<Recording | null>(recordings[0] ?? null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        {current ? (
          <div className="overflow-hidden rounded-xl2 ring-1 ring-edge/70">
            <Player key={current.url} src={current.url} />
          </div>
        ) : (
          <div className="grid aspect-video w-full place-items-center rounded-lg bg-ink-2 text-muted">
            Selecciona una repetición
          </div>
        )}
      </div>

      <ul className="space-y-2">
        {recordings.map((r) => (
          <li key={r.url}>
            <button
              onClick={() => setCurrent(r)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                current?.url === r.url
                  ? "border-brand bg-ink-3"
                  : "border-edge bg-ink-2 hover:bg-ink-3"
              }`}
            >
              <p className="text-sm font-semibold">{fmtDate(r.start)}</p>
              <p className="text-xs text-muted">Duración: {fmtDuration(r.duration)}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
