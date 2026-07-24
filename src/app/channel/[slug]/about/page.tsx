import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChannel, isFollowing } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { listRecordings } from "@/lib/mediamtx";
import { Player } from "@/components/Player";
import { FollowButton } from "@/components/FollowButton";
import { ChannelProfileEditor } from "@/components/ChannelProfileEditor";
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

function Tab({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-ink-3 text-fg" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const channel = await getChannel(slug);
  if (!channel) notFound();

  const session = await getSession();
  const isOwner = !!session && (session.userId === channel.ownerUserId || session.role === "admin");
  const following = session ? await isFollowing(session.userId, slug) : false;
  const recordings = await listRecordings(channel.streamKey);

  const trailer = channel.trailerUrl?.trim() || "";
  const isHls = trailer.endsWith(".m3u8");

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Cabecera del canal */}
      <div className="flex flex-wrap items-center gap-4">
        <Image
          src={channel.avatarUrl}
          alt={channel.displayName}
          width={72}
          height={72}
          unoptimized
          className="size-16 rounded-full bg-ink-3 ring-2 ring-brand sm:size-[72px]"
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
      <div className="mt-4 flex gap-1 border-b border-edge pb-3">
        <Tab href={`/channel/${channel.slug}`}>Directo</Tab>
        <Tab href={`/channel/${channel.slug}/about`} active>Sobre el canal</Tab>
        <Tab href={`/channel/${channel.slug}/vod`}>Vídeos</Tab>
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
          isHls ? (
            <Player src={trailer} poster={channel.thumbnailUrl} />
          ) : (
            <video
              src={trailer}
              poster={channel.thumbnailUrl}
              controls
              playsInline
              className="aspect-video w-full rounded-xl2 bg-black"
            />
          )
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
