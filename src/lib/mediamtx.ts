import "server-only";

/**
 * Integración con MediaMTX (media server open-source, sin credenciales).
 * OBS emite por RTMP → MediaMTX transcodifica a HLS → lo reproduce la web.
 *
 * Variables de entorno (con valores por defecto para desarrollo local):
 *   MEDIAMTX_RTMP     rtmp://localhost:1935   (ingesta desde OBS)
 *   MEDIAMTX_HLS_BASE http://localhost:8888   (salida HLS)
 *   MEDIAMTX_API      http://localhost:9997   (API de estado)
 */

export const RTMP_BASE = process.env.MEDIAMTX_RTMP ?? "rtmp://localhost:1935";
const HLS_BASE = process.env.MEDIAMTX_HLS_BASE ?? "http://localhost:8888";
const API_BASE = process.env.MEDIAMTX_API ?? "http://localhost:9997";
// Servidor de reproducción de grabaciones (VOD). PLAYBACK_BASE lo usa el
// navegador; PLAYBACK_API lo consulta el servidor (útil dentro de Docker).
const PLAYBACK_BASE = process.env.MEDIAMTX_PLAYBACK_BASE ?? "http://localhost:9996";
const PLAYBACK_API = process.env.MEDIAMTX_PLAYBACK_API ?? PLAYBACK_BASE;

// ABR (múltiples calidades por transcodificación). Off por defecto: la demo usa
// passthrough. Se activa con MEDIAMTX_ABR=1 y el MediaMTX con ffmpeg (ver docs).
export const ABR_ENABLED = process.env.MEDIAMTX_ABR === "1";

/** Calidades que produce el transcodificador ABR (deben coincidir con mediamtx-abr.yml). */
const ABR_VARIANTS = [
  { suffix: "", bandwidth: 5200000, resolution: "1920x1080" },
  { suffix: "_720", bandwidth: 2800000, resolution: "1280x720" },
  { suffix: "_480", bandwidth: 1400000, resolution: "854x480" },
  { suffix: "_360", bandwidth: 800000, resolution: "640x360" },
];

export function ingestUrl(): string {
  return RTMP_BASE;
}

export function hlsUrlFor(streamKey: string): string {
  return `${HLS_BASE}/${streamKey}/index.m3u8`;
}

/** URL de reproducción que usa la web: master ABR si está activado, o HLS directo. */
export function watchUrlFor(streamKey: string): string {
  return ABR_ENABLED ? `/api/hls/${encodeURIComponent(streamKey)}` : hlsUrlFor(streamKey);
}

/** Master playlist HLS que combina las calidades del ABR (lo sirve /api/hls/[key]). */
export function buildMasterPlaylist(streamKey: string): string {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3"];
  for (const v of ABR_VARIANTS) {
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${v.bandwidth},RESOLUTION=${v.resolution}`);
    lines.push(`${HLS_BASE}/${streamKey}${v.suffix}/index.m3u8`);
  }
  return lines.join("\n") + "\n";
}

/**
 * Consulta a la API de MediaMTX si un path está emitiendo en directo.
 * Si el media server no está levantado, devuelve false sin bloquear.
 */
export async function isPathLive(streamKey: string | null | undefined): Promise<boolean> {
  if (!streamKey) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${API_BASE}/v3/paths/get/${encodeURIComponent(streamKey)}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = (await res.json()) as { ready?: boolean };
    return Boolean(data.ready);
  } catch {
    return false;
  }
}

export interface Recording {
  start: string;
  duration: number;
  url: string;
}

/**
 * Lista las grabaciones (repeticiones) disponibles de un canal consultando el
 * servidor de reproducción de MediaMTX. Devuelve [] si no está disponible.
 */
export async function listRecordings(streamKey: string | null | undefined): Promise<Recording[]> {
  if (!streamKey) return [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`${PLAYBACK_API}/list?path=${encodeURIComponent(streamKey)}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as { start: string; duration: number }[];
    return data.map((r) => ({
      start: r.start,
      duration: r.duration,
      url:
        `${PLAYBACK_BASE}/get?path=${encodeURIComponent(streamKey)}` +
        `&start=${encodeURIComponent(r.start)}&duration=${r.duration}&format=mp4`,
    }));
  } catch {
    return [];
  }
}
