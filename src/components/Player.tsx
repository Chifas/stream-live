"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface PlayerProps {
  src: string;
  poster?: string;
}

/**
 * Reproductor HLS. Usa hls.js en navegadores sin soporte nativo (Chrome,
 * Firefox, Edge) y el soporte nativo de Safari cuando está disponible.
 */
export function Player({ src, poster }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setReady(false);
    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS: HLS nativo.
      video.src = src;
      video.addEventListener("loadedmetadata", () => setReady(true), { once: true });
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setReady(true));
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("No se pudo cargar la emisión. Reintentando…");
      });
    } else {
      setError("Tu navegador no soporta la reproducción HLS.");
    }

    return () => {
      hls?.destroy();
    };
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        poster={poster}
        controls
        autoPlay
        muted
        playsInline
        className="h-full w-full"
      />
      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/60 text-sm text-muted">
          <span className="animate-pulse">Conectando con la emisión…</span>
        </div>
      )}
      {error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-sm text-muted">
          {error}
        </div>
      )}
    </div>
  );
}
