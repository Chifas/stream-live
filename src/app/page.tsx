import Link from "next/link";
import Image from "next/image";
import { getChannels, getCategories } from "@/lib/queries";
import { ChannelCard } from "@/components/ChannelCard";
import { formatViewers } from "@/lib/format";
import { getT } from "@/i18n/server";
import { PlayIcon, ArrowRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [channels, categories, t] = await Promise.all([
    getChannels(),
    getCategories(),
    getT(),
  ]);
  const featured = channels[0]; // el de más espectadores
  const rest = channels.filter((c) => c.slug !== featured.slug);

  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
      {/* Hero destacado */}
      <Link
        href={`/channel/${featured.slug}`}
        className="group relative mb-10 block overflow-hidden rounded-xl2 border border-edge/70"
      >
        <Image
          src={featured.thumbnailUrl}
          alt={featured.title}
          width={1280}
          height={520}
          unoptimized
          className="h-[300px] w-full object-cover md:h-[420px]"
        />
        {/* Capas de degradado para el texto (acento moderno). */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand/25 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-live px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-soft">
            <span className="size-1.5 rounded-full bg-white live-dot" /> {t("home.live")}
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-3xl font-black leading-tight md:text-5xl">
            {featured.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="flex items-center gap-2">
              <Image
                src={featured.avatarUrl}
                alt={featured.displayName}
                width={32}
                height={32}
                unoptimized
                className="size-8 rounded-full bg-ink-3 ring-2 ring-brand/60"
              />
              <span className="font-semibold text-fg">{featured.displayName}</span>
            </span>
            <span className="text-muted">· {featured.category}</span>
            <span className="flex items-center gap-1.5 font-semibold text-live">
              <span className="size-2 rounded-full bg-live live-dot" />
              <span className="tabular-nums">{formatViewers(featured.baseViewers)}</span>
              <span className="text-muted">{t("home.viewersNow")}</span>
            </span>
          </div>
          <span className="btn-brand mt-5 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold">
            <PlayIcon className="size-4" /> {t("home.live")}
            <ArrowRightIcon className="size-4" />
          </span>
        </div>
      </Link>

      {/* Directos */}
      <section className="mb-12">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-balance">
          <span className="h-5 w-1 rounded-full bg-brand" /> {t("home.popular")}
        </h2>
        <div className="grid animate-in grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rest.map((c) => (
            <ChannelCard key={c.slug} channel={c} />
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <span className="h-5 w-1 rounded-full bg-accent" /> {t("home.categories")}
          </h2>
          <Link href="/browse" className="text-sm font-semibold text-brand-2 hover:underline">
            {t("home.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?q=${encodeURIComponent(cat.name)}`}
              className="group"
            >
              <div className="lift overflow-hidden rounded-xl2 ring-1 ring-edge/70">
                <Image
                  src={cat.coverUrl}
                  alt={cat.name}
                  width={640}
                  height={360}
                  unoptimized
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
              <p className="mt-2 truncate text-sm font-semibold">{cat.name}</p>
              <p className="text-xs tabular-nums text-muted">
                {formatViewers(cat.viewers)} esp.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
