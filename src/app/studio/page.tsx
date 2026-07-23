export const metadata = {
  title: "Studio — Empieza a emitir | StreamLive",
};

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-black">Studio del creador</h1>
      <p className="mt-2 text-muted">
        Aquí es donde configurarías tu emisión. La captura de vídeo real (RTMP /
        WebRTC) necesita un <span className="text-white">media server</span> que
        no se incluye en esta demo, pero abajo tienes los datos de conexión de
        ejemplo y los pasos que seguiría una implementación completa.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-edge bg-ink-2 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            Servidor de ingesta (RTMP)
          </h2>
          <code className="mt-2 block rounded bg-ink-3 px-3 py-2 text-sm text-brand-2">
            rtmp://ingest.tu-dominio.com/live
          </code>
          <h2 className="mt-4 text-sm font-bold uppercase tracking-wide text-muted">
            Clave de emisión
          </h2>
          <code className="mt-2 block select-all rounded bg-ink-3 px-3 py-2 text-sm text-brand-2">
            live_demo_xxxxxxxxxxxxxxxxxxxx
          </code>
          <p className="mt-3 text-xs text-muted">
            Copia estos datos en OBS Studio → Ajustes → Emisión.
          </p>
        </div>

        <div className="rounded-lg border border-edge bg-ink-2 p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
            Cómo funcionaría la tubería completa
          </h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-white/90">
            <li>OBS envía vídeo por RTMP al servidor de ingesta.</li>
            <li>
              Un media server (ej. <span className="text-brand-2">MediaMTX</span>,{" "}
              <span className="text-brand-2">nginx-rtmp</span> o{" "}
              <span className="text-brand-2">Livepeer</span>) transcodifica a HLS/LL-HLS.
            </li>
            <li>El manifiesto <code>.m3u8</code> se sirve desde un CDN.</li>
            <li>El reproductor hls.js de esta app consume ese manifiesto.</li>
            <li>El chat viaja en paralelo por el WebSocket ya implementado.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
