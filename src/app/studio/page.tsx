import Link from "next/link";
import { getSession } from "@/lib/session";
import { getChannelByOwner } from "@/lib/queries";
import { ingestUrl, isPathLive } from "@/lib/mediamtx";
import { CopyField } from "@/components/CopyField";

export const metadata = { title: "Studio — Empieza a emitir | StreamLive" };
export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const session = await getSession();
  const channel = session ? await getChannelByOwner(session.userId) : undefined;
  const live = channel ? await isPathLive(channel.streamKey) : false;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-black">Studio del creador</h1>
      <p className="mt-2 text-muted">
        Emite en directo <span className="text-white">de verdad</span> con OBS y
        el media server <span className="text-brand-2">MediaMTX</span> (gratis, sin
        cuentas). Levántalo con <code className="text-brand-2">docker compose up</code>.
      </p>

      {!session ? (
        <div className="mt-6 rounded-lg border border-edge bg-ink-2 p-4">
          <p className="text-muted">
            Inicia sesión como creador para ver tu clave de emisión.
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-2"
          >
            Entrar
          </Link>
          <p className="mt-3 text-xs text-muted">
            Cuenta de demo con canal propio: <code>streamer / demo1234</code>
          </p>
        </div>
      ) : !channel ? (
        <div className="mt-6 rounded-lg border border-edge bg-ink-2 p-4 text-muted">
          Tu usuario no tiene ningún canal asignado. La cuenta de demo{" "}
          <code>streamer</code> es dueña del canal <code>nova_plays</code>.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold ${
                live ? "bg-live text-white" : "bg-ink-3 text-muted"
              }`}
            >
              {live ? "● EN DIRECTO" : "SIN EMISIÓN"}
            </span>
            <span className="text-sm text-muted">
              Canal: <Link href={`/channel/${channel.slug}`} className="text-brand-2 hover:underline">{channel.displayName}</Link>
            </span>
          </div>

          <div className="rounded-lg border border-edge bg-ink-2 p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
              Configura OBS → Ajustes → Emisión (Servicio: Personalizado)
            </h2>
            <CopyField label="Servidor" value={ingestUrl()} />
            <div className="mt-3" />
            <CopyField label="Clave de retransmisión" value={channel.streamKey ?? channel.slug} secret />
            <p className="mt-3 text-xs text-muted">
              Pulsa «Iniciar transmisión» en OBS y abre tu canal: el reproductor
              cambiará automáticamente de la demo a tu emisión real.
            </p>
          </div>

          <div className="rounded-lg border border-edge bg-ink-2 p-4">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
              Tubería completa
            </h2>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-white/90">
              <li>OBS envía RTMP a <code>{ingestUrl()}</code>.</li>
              <li>MediaMTX transcodifica a HLS y expone <code>/{channel.streamKey}/index.m3u8</code>.</li>
              <li>La web detecta el directo por la API de MediaMTX y lo reproduce.</li>
              <li>El chat viaja en paralelo por el WebSocket ya implementado.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
