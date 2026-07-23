import { NextResponse } from "next/server";
import { getEmoteMap } from "@/lib/emotes";

/** Devuelve el mapa de emotes globales (nombre -> URL) para el chat. */
export async function GET() {
  const map = await getEmoteMap();
  return NextResponse.json(map, {
    headers: {
      // Cacheable en el navegador/CDN durante una hora.
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
