import Link from "next/link";
import Image from "next/image";
import { getChannels, getCategories } from "@/lib/queries";
import { ChannelCard } from "@/components/ChannelCard";
import { formatViewers } from "@/lib/format";
import { getT } from "@/i18n/server";

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
        className="group relative mb-8 flex flex-col gap-4 overflow-hidden rounded-xl border border-edge bg-gradient-to-r from-ink-3 to-ink-2 p-4 md:flex-row md:items-center md:p-6"
      >
        <Image
          src={featured.thumbnailUrl}
          alt={featured.title}
          width={640}
          height={360}
          unoptimized
          className="aspect-video w-full rounded-lg object-cover md:w-96"
        />
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 rounded bg-live px-2 py-0.5 text-xs font-bold uppercase text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white live-dot" /> {t("home.live")}
          </span>
          <h1 className="mt-3 text-2xl font-black md:text-3xl">{featured.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-muted">
            <Image
              src={featured.avatarUrl}
              alt={featured.displayName}
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 rounded-full bg-ink-3"
            />
            <span className="font-semibold text-white">{featured.displayName}</span>
            · {featured.category}
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted">{featured.about}</p>
          <p className="mt-3 text-sm font-semibold text-brand-2">
            {formatViewers(featured.baseViewers)} {t("home.viewersNow")}
          </p>
        </div>
      </Link>

      {/* Directos */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">{t("home.popular")}</h2>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rest.map((c) => (
            <ChannelCard key={c.slug} channel={c} />
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t("home.categories")}</h2>
          <Link href="/browse" className="text-sm text-brand-2 hover:underline">
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
              <Image
                src={cat.coverUrl}
                alt={cat.name}
                width={640}
                height={360}
                unoptimized
                className="aspect-[3/4] w-full rounded-md object-cover transition group-hover:brightness-110"
              />
              <p className="mt-1 truncate text-sm font-semibold">{cat.name}</p>
              <p className="text-xs text-muted">{formatViewers(cat.viewers)} esp.</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
