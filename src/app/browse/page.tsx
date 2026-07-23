import Image from "next/image";
import Link from "next/link";
import { getCategories, getChannels } from "@/lib/queries";
import { ChannelCard } from "@/components/ChannelCard";
import { formatViewers } from "@/lib/format";

export const metadata = {
  title: "Explorar categorías — StreamLive",
};

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const [categories, channels] = await Promise.all([getCategories(), getChannels()]);
  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-black">Explorar</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Categorías</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link key={cat.slug} href="/" className="group">
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

      <section>
        <h2 className="mb-4 text-xl font-bold">Todos los directos</h2>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.map((c) => (
            <ChannelCard key={c.slug} channel={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
