"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface PlayerProps {
  src: string;
  poster?: string;
}

interface Level {
  index: number;
  height: number;
}

/**
 * Reproductor HLS con hls.js (fallback nativo en Safari) y controles extra:
 * selector de calidad, Picture-in-Picture y pantalla completa.
 */
export function Player({ src, poster }: PlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [current, setCurrent] = useState(-1); // -1 = auto
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setReady(false);
    setLevels([]);
    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => setReady(true), { once: true });
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setReady(true);
        setLevels(
          hls!.levels
            .map((l, index) => ({ index, height: l.height }))
            .filter((l) => l.height > 0)
            .reverse(),
        );
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("No se pudo cargar la emisión. Reintentando…");
      });
    } else {
      setError("Tu navegador no soporta la reproducción HLS.");
    }

    return () => {
      hls?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  function setQuality(index: number) {
    setCurrent(index);
    setMenuOpen(false);
    if (hlsRef.current) hlsRef.current.currentLevel = index;
  }

  async function togglePiP() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* PiP no disponible */
    }
  }

  function toggleFullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen().catch(() => {});
  }

  return (
    <div ref={wrapRef} className="relative aspect-video w-full bg-black">
      <video
        ref={videoRef}
        poster={poster}
        controls
        autoPlay
        muted
        playsInline
        className="h-full w-full"
      />

      {/* Controles extra */}
      <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5">
        {levels.length > 0 && (
          <div className="pointer-events-auto relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Calidad de vídeo"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white hover:bg-black/90"
            >
              {current === -1 ? "Auto" : `${levels.find((l) => l.index === current)?.height ?? ""}p`}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-28 overflow-hidden rounded-md border border-edge bg-ink-2 text-xs shadow-xl">
                <button
                  onClick={() => setQuality(-1)}
                  className={`block w-full px-3 py-1.5 text-left hover:bg-ink-3 ${current === -1 ? "text-brand-2" : ""}`}
                >
                  Auto
                </button>
                {levels.map((l) => (
                  <button
                    key={l.index}
                    onClick={() => setQuality(l.index)}
                    className={`block w-full px-3 py-1.5 text-left hover:bg-ink-3 ${current === l.index ? "text-brand-2" : ""}`}
                  >
                    {l.height}p
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          onClick={togglePiP}
          aria-label="Picture in picture"
          title="Picture in picture"
          className="pointer-events-auto rounded bg-black/70 px-2 py-1 text-xs text-white hover:bg-black/90"
        >
          ⧉
        </button>
        <button
          onClick={toggleFullscreen}
          aria-label="Pantalla completa"
          title="Pantalla completa"
          className="pointer-events-auto rounded bg-black/70 px-2 py-1 text-xs text-white hover:bg-black/90"
        >
          ⛶
        </button>
      </div>

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
