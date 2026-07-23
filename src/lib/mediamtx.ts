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

export function ingestUrl(): string {
  return RTMP_BASE;
}

export function hlsUrlFor(streamKey: string): string {
  return `${HLS_BASE}/${streamKey}/index.m3u8`;
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
