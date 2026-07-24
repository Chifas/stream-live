import { buildMasterPlaylist } from "@/lib/mediamtx";

/**
 * Master playlist HLS que combina las calidades del ABR. El reproductor lo carga
 * y ofrece el menú Auto/1080p/720p/480p/360p adaptándose a la conexión.
 * Las calidades las genera ffmpeg lanzado por MediaMTX (ver mediamtx-abr.yml).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return new Response(buildMasterPlaylist(key), {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "no-store",
    },
  });
}
