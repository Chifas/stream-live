import { searchChannels } from "@/lib/queries";
import { ChannelCard } from "@/components/ChannelCard";

export const metadata = { title: "Buscar — StreamLive" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchChannels(q) : [];

  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-black">Resultados</h1>
      <p className="mb-6 text-muted">
        {q ? (
          <>
            {results.length} resultado{results.length === 1 ? "" : "s"} para{" "}
            <span className="text-white">“{q}”</span>
          </>
        ) : (
          "Escribe algo en la barra de búsqueda."
        )}
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((c) => (
            <ChannelCard key={c.slug} channel={c} />
          ))}
        </div>
      ) : (
        q && (
          <div className="rounded-lg border border-edge bg-ink-2 p-8 text-center text-muted">
            No hay canales que coincidan con tu búsqueda.
          </div>
        )
      )}
    </div>
  );
}
