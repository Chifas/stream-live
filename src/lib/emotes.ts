import "server-only";

/**
 * Emotes personalizados desde proveedores de terceros con API pública y SIN
 * credenciales: 7TV, BetterTTV (BTTV) y FrankerFaceZ (FFZ). Son los emotes
 * "custom" que usa la comunidad de streaming. Se cargan los sets globales y se
 * cachean en memoria.
 *
 * Los emotes NATIVOS de Twitch (primera parte) requerirían la API de Twitch con
 * client-id/secret; se dejan para más adelante (ver MEJORAS.md).
 */

export type EmoteMap = Record<string, string>; // nombre -> URL de imagen

let cache: { map: EmoteMap; ts: number } | null = null;
const TTL = 60 * 60 * 1000; // 1 hora

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function sevenTv(): Promise<EmoteMap> {
  const data = await safeJson<{
    emotes: { name: string; data: { host: { url: string } } }[];
  }>("https://7tv.io/v3/emote-sets/global");
  const map: EmoteMap = {};
  for (const e of data?.emotes ?? []) {
    if (e.data?.host?.url) map[e.name] = `https:${e.data.host.url}/2x.webp`;
  }
  return map;
}

async function bttv(): Promise<EmoteMap> {
  const data = await safeJson<{ id: string; code: string }[]>(
    "https://api.betterttv.net/3/cached/emotes/global",
  );
  const map: EmoteMap = {};
  for (const e of data ?? []) {
    map[e.code] = `https://cdn.betterttv.net/emote/${e.id}/2x`;
  }
  return map;
}

async function ffz(): Promise<EmoteMap> {
  const data = await safeJson<{
    sets: Record<string, { emoticons: { name: string; urls: Record<string, string> }[] }>;
  }>("https://api.frankerfacez.com/v1/set/global");
  const map: EmoteMap = {};
  for (const set of Object.values(data?.sets ?? {})) {
    for (const e of set.emoticons ?? []) {
      const url = e.urls["2"] ?? e.urls["1"];
      if (url) map[e.name] = url.startsWith("http") ? url : `https:${url}`;
    }
  }
  return map;
}

export async function getEmoteMap(): Promise<EmoteMap> {
  if (cache && Date.now() - cache.ts < TTL) return cache.map;

  // Best-effort: si un proveedor falla, se ignora.
  const [a, b, c] = await Promise.all([sevenTv(), bttv(), ffz()]);
  const map: EmoteMap = { ...c, ...b, ...a }; // 7TV tiene prioridad
  cache = { map, ts: Date.now() };
  return map;
}
