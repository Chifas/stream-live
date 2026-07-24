import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChannel, isFollowing, getPanels } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { listRecordings } from "@/lib/mediamtx";
import { Player } from "@/components/Player";
import { FollowButton } from "@/components/FollowButton";
import { ChannelProfileEditor } from "@/components/ChannelProfileEditor";
import { Panels } from "@/components/Panels";
import { ChannelTabs } from "@/components/ChannelTabs";
import { VideoIcon, InfoIcon, ReplayIcon } from "@/components/icons";
import { formatViewers } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const channel = await getChannel(slug);
  return { title: channel ? `Sobre ${channel.displayName}` : "Canal" };
}

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const channel = await getChannel(slug);
  if (!channel) notFound();

  const session = await getSession();
  const isOwner = !!session && (session.userId === channel.ownerUserId || session.role === "admin");
  const following = session ? await isFollowing(session.userId, slug) : false;
  const [recordings, panels] = await Promise.all([
    listRecordings(channel.streamKey),
    getPanels(slug),
  ]);

  const trailer = channel.trailerUrl?.trim() || "";
  const banner = channel.bannerUrl?.trim() || "";

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Banner de portada */}
      <div className="overflow-hidden rounded-xl2 ring-1 ring-edge/70">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner} alt={`Banner de ${channel.displayName}`} className="h-32 w-full object-cover sm:h-44" />
        ) : (
          <div className="h-32 w-full bg-gradient-to-r from-brand/40 via-ink-2 to-accent/20 sm:h-44" />
        )}
      </div>

      {/* Cabecera del canal */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <Image
          src={channel.avatarUrl}
          alt={channel.displayName}
          width={80}
          height={80}
          unoptimized
          className="-mt-10 size-20 rounded-full bg-ink-3 ring-4 ring-ink"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black">{channel.displayName}</h1>
          <p className="text-sm text-muted">
            {channel.category} · <span className="tabular-nums">{formatViewers(channel.followers)}</span> seguidores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FollowButton slug={channel.slug} initialFollowing={following} />
        </div>
      </div>

      {/* Sub-navegación */}
      <div className="mt-4">
        <ChannelTabs slug={channel.slug} active="about" />
      </div>

      {isOwner && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-brand/40 bg-brand/10 px-4 py-3">
          <p className="text-sm">
            <span className="font-semibold">Eres el dueño de este canal.</span>{" "}
            <span className="text-muted">Puedes editar el tráiler y la descripción.</span>
          </p>
          <ChannelProfileEditor
            initialBio={channel.bio ?? ""}
            initialTrailer={channel.trailerUrl ?? ""}
            initialBanner={channel.bannerUrl ?? ""}
            label="Editar perfil"
          />
        </div>
      )}

      {/* Tráiler */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <VideoIcon className="size-5 text-brand-2" /> Tráiler del canal
        </h2>
        {trailer ? (
          <div className="overflow-hidden rounded-xl2 ring-1 ring-edge/70">
            <Player src={trailer} poster={channel.thumbnailUrl} />
          </div>
        ) : (
          <div className="grid aspect-video w-full place-items-center rounded-xl2 border border-dashed border-edge bg-ink-2 text-center text-muted">
            <div>
              <VideoIcon className="mx-auto size-8 opacity-60" />
              <p className="mt-2 text-sm">
                {isOwner
                  ? "Aún no has añadido un tráiler. Pulsa «Editar perfil» para añadir uno."
                  : "Este canal todavía no tiene tráiler."}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Descripción */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <InfoIcon className="size-5 text-brand-2" /> Acerca de {channel.displayName}
        </h2>
        <div className="card p-5">
          {channel.bio?.trim() ? (
            <p className="whitespace-pre-line text-pretty text-sm leading-relaxed text-fg/90">
              {channel.bio}
            </p>
          ) : (
            <p className="text-sm text-muted">
              {isOwner
                ? "Añade una descripción para que la gente conozca tu canal."
                : channel.about}
            </p>
          )}
        </div>
      </section>

      {/* Paneles del canal */}
      {(panels.length > 0 || isOwner) && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <InfoIcon className="size-5 text-brand-2" /> Paneles
          </h2>
          <Panels panels={panels} isOwner={isOwner} />
        </section>
      )}

      {/* Últimos directos */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ReplayIcon className="size-5 text-brand-2" /> Últimos directos
          </h2>
          <Link href={`/channel/${channel.slug}/vod`} className="text-sm font-semibold text-brand-2 hover:underline">
            Ver todos
          </Link>
        </div>
        {recordings.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {recordings.slice(0, 4).map((r) => (
              <li key={r.url}>
                <Link href={`/channel/${channel.slug}/vod`} className="card lift block p-3">
                  <p className="text-sm font-semibold">{new Date(r.start).toLocaleString("es-ES")}</p>
                  <p className="text-xs text-muted">Duración: {Math.round(r.duration / 60)} min</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="card p-5 text-sm text-muted">
            Aún no hay directos guardados. Las repeticiones aparecen aquí cuando el canal
            emite con MediaMTX.
          </div>
        )}
      </section>
    </div>
  );
}
