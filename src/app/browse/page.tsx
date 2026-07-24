import { getCategories, getChannels } from "@/lib/queries";
import { ChannelCard } from "@/components/ChannelCard";
import { CategoryCard } from "@/components/CategoryCard";

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
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
          <span className="h-5 w-1 rounded-full bg-accent" /> Categorías
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              coverUrl={cat.coverUrl}
              viewers={cat.viewers}
              href={`/search?q=${encodeURIComponent(cat.name)}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
          <span className="h-5 w-1 rounded-full bg-brand" /> Todos los directos
        </h2>
        <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.map((c) => (
            <ChannelCard key={c.slug} channel={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
