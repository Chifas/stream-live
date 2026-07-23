"use client";

import { useEffect, useState } from "react";
import { formatViewers } from "@/lib/format";

/**
 * Muestra el número de espectadores. Parte de una base sembrada y le suma los
 * espectadores reales conectados al chat (evento "sl:viewers" emitido por Chat).
 */
export function LiveViewers({ base }: { base: number }) {
  const [live, setLive] = useState(0);

  useEffect(() => {
    function onViewers(e: Event) {
      setLive((e as CustomEvent<number>).detail);
    }
    window.addEventListener("sl:viewers", onViewers);
    return () => window.removeEventListener("sl:viewers", onViewers);
  }, []);

  return (
    <span className="flex items-center gap-1.5 text-live">
      <span className="h-2.5 w-2.5 rounded-full bg-live live-dot" />
      <span className="font-semibold">{formatViewers(base + live)}</span>
      <span className="text-muted">espectadores</span>
    </span>
  );
}
