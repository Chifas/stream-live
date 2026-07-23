import Link from "next/link";
import Image from "next/image";
import { getChannels } from "@/lib/queries";
import { formatViewers } from "@/lib/format";

export async function Sidebar() {
  const live = await getChannels();

  return (
    <aside
      aria-label="Canales recomendados"
      className="hidden w-60 shrink-0 border-r border-edge bg-ink-2 lg:block"
    >
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-4">
        <h2 className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted">
          Canales recomendados
        </h2>
        <ul>
          {live.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/channel/${c.slug}`}
                className="flex items-center gap-2 px-4 py-2 transition hover:bg-ink-3"
              >
                <Image
                  src={c.avatarUrl}
                  alt={c.displayName}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-full bg-ink-3"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {c.displayName}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {c.category}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full bg-live live-dot" />
                  {formatViewers(c.baseViewers)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
