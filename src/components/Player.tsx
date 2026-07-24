"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
  PipIcon,
  MaximizeIcon,
  SettingsIcon,
} from "./icons";

interface PlayerProps {
  src: string;
  poster?: string;
  /** Directo: sin barra de progreso, muestra el indicador LIVE. */
  live?: boolean;
}

interface Level {
  index: number;
  height: number;
  fps: number;
}

/** Etiqueta de calidad estilo Twitch: 1080p60 / 720p / … */
function qualityLabel(l: Level): string {
  const fps = l.fps >= 50 ? String(Math.round(l.fps)) : "";
  return `${l.height}p${fps}`;
}

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Barra deslizante personalizada (0..1). */
function Slider({
  value,
  buffered,
  onSeek,
  className = "",
  ariaLabel,
}: {
  value: number;
  buffered?: number;
  onSeek: (v: number) => void;
  className?: string;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const at = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };
  return (
    <div
      ref={ref}
      role="slider"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value * 100)}
      tabIndex={0}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onSeek(at(e.clientX));
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) onSeek(at(e.clientX));
      }}
      className={`group/bar relative flex h-3 cursor-pointer items-center ${className}`}
    >
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/25">
        {buffered != null && (
          <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${buffered * 100}%` }} />
        )}
        <div className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${value * 100}%` }} />
      </div>
      <div
        className="absolute size-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
        style={{ left: `${value * 100}%` }}
      />
    </div>
  );
}

/**
 * Reproductor de vídeo personalizado (sin controles nativos). Soporta HLS
 * (vía hls.js o nativo en Safari) y ficheros directos (mp4). Controles propios:
 * play/pausa, volumen, barra de progreso, calidad, PiP y pantalla completa,
 * con auto-ocultado y atajos de teclado.
 */
export function Player({ src, poster, live = false }: PlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [levels, setLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState(-1);
  const [menu, setMenu] = useState(false);
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setReady(false);
    setError(null);
    setLevels([]);
    const isHls = src.endsWith(".m3u8");
    let hls: Hls | null = null;

    if (!isHls) {
      video.src = src;
    } else if (Hls.isSupported()) {
      // Preferimos hls.js: da control de calidad/FPS (el HLS nativo no lo expone).
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(
          hls!.levels
            .map((l, index) => ({
              index,
              height: l.height,
              fps: l.frameRate || Number(l.attrs?.["FRAME-RATE"]) || 0,
            }))
            .filter((l) => l.height > 0)
            .reverse(),
        );
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("No se pudo cargar la emisión. Reintentando…");
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS: HLS nativo (sin selector de calidad).
      video.src = src;
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Tu navegador no soporta este vídeo.");
    }

    return () => {
      hls?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  const revealUI = useCallback(() => {
    setShowUI(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowUI(false);
    }, 2600);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 0.5;
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
  };

  const seek = (frac: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = frac * duration;
  };

  const setQuality = (index: number) => {
    setLevel(index);
    setMenu(false);
    if (hlsRef.current) hlsRef.current.currentLevel = index;
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {}
  };

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen().catch(() => {});
  };

  function onKey(e: React.KeyboardEvent) {
    const v = videoRef.current;
    if (!v) return;
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "m":
        toggleMute();
        break;
      case "ArrowRight":
        if (!live) v.currentTime = Math.min(duration, v.currentTime + 5);
        break;
      case "ArrowLeft":
        if (!live) v.currentTime = Math.max(0, v.currentTime - 5);
        break;
    }
    revealUI();
  }

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onMouseMove={revealUI}
      onMouseLeave={() => !videoRef.current?.paused && setShowUI(false)}
      onKeyDown={onKey}
      className={`group relative aspect-video w-full select-none overflow-hidden bg-black outline-none ${
        showUI || !playing ? "cursor-default" : "cursor-none"
      }`}
    >
      <video
        ref={videoRef}
        poster={poster}
        autoPlay
        muted
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          revealUI();
        }}
        onPause={() => {
          setPlaying(false);
          setShowUI(true);
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setReady(true)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onVolumeChange={(e) => {
          setMuted(e.currentTarget.muted);
          setVolume(e.currentTarget.volume);
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrent(v.currentTime);
          if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1) / (v.duration || 1));
        }}
        className="h-full w-full"
      />

      {/* Spinner de carga */}
      {(buffering || !ready) && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="size-12 animate-spin rounded-full border-[3px] border-white/25 border-t-brand" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-sm text-muted">
          {error}
        </div>
      )}

      {/* Botón central de play */}
      {!playing && ready && !error && (
        <button
          onClick={togglePlay}
          aria-label="Reproducir"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="btn-brand grid size-16 place-items-center rounded-full shadow-pop transition-transform duration-150 hover:scale-105">
            <PlayIcon className="size-7" />
          </span>
        </button>
      )}

      {/* LIVE badge */}
      {live && (
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-live px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-soft">
          <span className="size-1.5 rounded-full bg-white live-dot" /> Live
        </span>
      )}

      {/* Barra de controles */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-8 transition-opacity duration-200 ${
          showUI || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        {!live && (
          <Slider
            ariaLabel="Progreso"
            value={duration ? current / duration : 0}
            buffered={buffered}
            onSeek={seek}
            className="mb-1"
          />
        )}

        <div className="flex items-center gap-2 text-white">
          <button onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproducir"} className="hover:text-brand-2">
            {playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
          </button>

          {/* Volumen */}
          <div className="group/vol flex items-center gap-1.5">
            <button onClick={toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"} className="hover:text-brand-2">
              {muted || volume === 0 ? <VolumeMuteIcon className="size-5" /> : <VolumeHighIcon className="size-5" />}
            </button>
            <div className="w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-16">
              <Slider ariaLabel="Volumen" value={muted ? 0 : volume} onSeek={changeVolume} className="w-16" />
            </div>
          </div>

          {/* Tiempo o LIVE */}
          {live ? (
            <span className="ml-1 flex items-center gap-1.5 text-xs font-semibold text-live">
              <span className="size-1.5 rounded-full bg-live live-dot" /> EN DIRECTO
            </span>
          ) : (
            <span className="ml-1 text-xs tabular-nums text-white/80">
              {fmt(current)} / {fmt(duration)}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {/* Calidad */}
            {levels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setMenu((v) => !v)}
                  aria-label="Calidad"
                  aria-expanded={menu}
                  className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold hover:text-brand-2"
                >
                  <SettingsIcon className="size-5" />
                  <span className="hidden sm:inline">
                    {level === -1
                      ? "Auto"
                      : (() => {
                          const l = levels.find((x) => x.index === level);
                          return l ? qualityLabel(l) : "";
                        })()}
                  </span>
                </button>
                {menu && (
                  <div className="absolute bottom-9 right-0 w-28 overflow-hidden rounded-md border border-edge bg-ink-2 text-xs shadow-xl">
                    <button
                      onClick={() => setQuality(-1)}
                      className={`block w-full px-3 py-1.5 text-left hover:bg-ink-3 ${level === -1 ? "text-brand-2" : ""}`}
                    >
                      Auto
                    </button>
                    {levels.map((l) => (
                      <button
                        key={l.index}
                        onClick={() => setQuality(l.index)}
                        className={`block w-full px-3 py-1.5 text-left hover:bg-ink-3 ${level === l.index ? "text-brand-2" : ""}`}
                      >
                        {qualityLabel(l)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={togglePiP} aria-label="Picture in picture" className="hover:text-brand-2">
              <PipIcon className="size-5" />
            </button>
            <button onClick={toggleFullscreen} aria-label="Pantalla completa" className="hover:text-brand-2">
              <MaximizeIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
