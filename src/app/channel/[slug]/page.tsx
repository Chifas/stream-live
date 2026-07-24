import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChannel, isFollowing } from "@/lib/queries";
import { isPathLive, watchUrlFor } from "@/lib/mediamtx";
import { getSession } from "@/lib/session";
import { getT } from "@/i18n/server";
import { Player } from "@/components/Player";
import { Chat } from "@/components/Chat";
import { LiveViewers } from "@/components/LiveViewers";
import { FollowButton } from "@/components/FollowButton";
import { ReplayIcon, StarIcon, InfoIcon } from "@/components/icons";
import { ChannelTabs } from "@/components/ChannelTabs";
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
  const t = await getT();

  // Emisión real (MediaMTX) si hay directo; si no, stream HLS de demo.
  const liveNow = await isPathLive(channel.streamKey);
  const videoSrc = liveNow ? watchUrlFor(channel.streamKey!) : channel.hlsUrl;

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-3.5rem)] lg:flex-row">
      {/* Columna principal: vídeo + info */}
      <div className="flex min-w-0 flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
        {/* En móvil el vídeo queda fijo arriba mientras se hace scroll. */}
        <div className="sticky top-14 z-20 bg-black lg:static lg:top-0 lg:z-auto">
          <Player src={videoSrc} poster={channel.thumbnailUrl} live />
        </div>

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
              <p className="mt-0.5 text-sm text-fg">{channel.title}</p>
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
                  {liveNow ? `● ${t("channel.realLive")}` : t("channel.demo")}
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
              <Link
                href={`/channel/${channel.slug}/about`}
                className="flex items-center gap-1.5 rounded-md bg-ink-3 px-4 py-2 text-sm font-semibold text-fg transition hover:bg-edge"
              >
                <InfoIcon className="size-4" /> {t("channel.about")}
              </Link>
              <Link
                href={`/channel/${channel.slug}/vod`}
                className="flex items-center gap-1.5 rounded-md bg-ink-3 px-4 py-2 text-sm font-semibold text-fg transition hover:bg-edge"
              >
                <ReplayIcon className="size-4" /> {t("channel.replays")}
              </Link>
              <button
                className="flex items-center gap-1.5 rounded-md bg-ink-3 px-4 py-2 text-sm font-semibold text-fg transition hover:bg-edge"
                title="Requiere integración de pagos (Stripe) — ver MEJORAS.md"
              >
                <StarIcon className="size-4" /> {t("channel.subscribe")}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4">
          <ChannelTabs slug={channel.slug} active="live" />
        </div>

        <div className="px-4 py-4">
          <div className="rounded-lg border border-edge bg-ink-2 p-4">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
              {t("channel.about")} {channel.displayName}
            </h2>
            <p className="text-sm text-fg/90">{channel.about}</p>
            <p className="mt-3 text-sm text-muted">
              {formatViewers(channel.followers)} {t("common.followers")} ·{" "}
              {t("channel.language")}: {channel.language}
            </p>
          </div>
        </div>
      </div>

      {/* Columna del chat: bajo el vídeo en móvil, barra lateral en escritorio. */}
      <div className="h-[70vh] w-full shrink-0 border-t border-edge lg:h-full lg:w-[360px] lg:border-l lg:border-t-0">
        <Chat channel={channel.slug} />
      </div>
    </div>
  );
}
