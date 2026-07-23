import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChannel, isFollowing } from "@/lib/queries";
import { isPathLive, hlsUrlFor } from "@/lib/mediamtx";
import { getSession } from "@/lib/session";
import { Player } from "@/components/Player";
import { Chat } from "@/components/Chat";
import { LiveViewers } from "@/components/LiveViewers";
import { FollowButton } from "@/components/FollowButton";
import { formatViewers } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const channel = await getChannel(slug);
  if (!channel) return { title: "Canal no encontrado — StreamLive" };
  return {
    title: `${channel.displayName} — ${channel.title}`,
    description: channel.about,
  };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const channel = await getChannel(slug);
  if (!channel) notFound();

  const session = await getSession();
  const following = session ? await isFollowing(session.userId, slug) : false;

  // Emisión real (MediaMTX) si hay directo; si no, stream HLS de demo.
  const liveNow = await isPathLive(channel.streamKey);
  const videoSrc = liveNow ? hlsUrlFor(channel.streamKey!) : channel.hlsUrl;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col xl:flex-row">
      {/* Columna principal: vídeo + info */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Player src={videoSrc} poster={channel.thumbnailUrl} />

        <div className="border-b border-edge px-4 py-4">
          <div className="flex flex-wrap items-start gap-3">
            <Image
              src={channel.avatarUrl}
              alt={channel.displayName}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-full bg-ink-3 ring-2 ring-brand"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{channel.displayName}</h1>
              </div>
              <p className="mt-0.5 text-sm text-white">{channel.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Link
                  href={`/browse`}
                  className="font-medium text-brand-2 hover:underline"
                >
                  {channel.category}
                </Link>
                <LiveViewers base={channel.baseViewers} />
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                    liveNow ? "bg-live text-white" : "bg-ink-3 text-muted"
                  }`}
                  title={
                    liveNow
                      ? "Emisión en directo real desde el media server"
                      : "Reproduciendo un stream HLS de demostración"
                  }
                >
                  {liveNow ? "● EMISIÓN REAL" : "DEMO"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {channel.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-ink-3 px-2 py-0.5 text-xs text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FollowButton slug={channel.slug} initialFollowing={following} />
              <button
                className="rounded-md bg-ink-3 px-4 py-2 text-sm font-semibold text-white transition hover:bg-edge"
                title="Requiere integración de pagos (Stripe) — ver MEJORAS.md"
              >
                ★ Suscribirse
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-lg border border-edge bg-ink-2 p-4">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
              Acerca de {channel.displayName}
            </h2>
            <p className="text-sm text-white/90">{channel.about}</p>
            <p className="mt-3 text-sm text-muted">
              {formatViewers(channel.followers)} seguidores · Idioma: {channel.language}
            </p>
          </div>
        </div>
      </div>

      {/* Columna del chat */}
      <div className="h-[60vh] w-full shrink-0 border-t border-edge xl:h-auto xl:w-[340px] xl:border-l xl:border-t-0">
        <Chat channel={channel.slug} />
      </div>
    </div>
  );
}
