import Link from "next/link";
import Image from "next/image";
import type { Channel } from "@/lib/queries";
import { formatViewers } from "@/lib/format";
import { getT } from "@/i18n/server";

export async function ChannelCard({ channel }: { channel: Channel }) {
  const t = await getT();
  return (
    <div className="group">
      <Link href={`/channel/${channel.slug}`} className="block">
        <div className="lift relative overflow-hidden rounded-xl2 ring-1 ring-edge/70">
          <Image
            src={channel.thumbnailUrl}
            alt={channel.title}
            width={640}
            height={360}
            unoptimized
            className="aspect-video w-full object-cover"
          />
          {/* Degradado inferior para legibilidad del contador. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-live px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-soft">
            <span className="size-1.5 rounded-full bg-white live-dot" /> {t("card.live")}
          </span>
          <span className="absolute bottom-2 left-2.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {formatViewers(channel.baseViewers)} {t("card.viewers")}
          </span>
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        <Link href={`/channel/${channel.slug}`} className="shrink-0">
          <Image
            src={channel.avatarUrl}
            alt={channel.displayName}
            width={40}
            height={40}
            unoptimized
            className="size-10 rounded-full bg-ink-3 ring-2 ring-transparent transition-[box-shadow] duration-150 group-hover:ring-brand/60"
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/channel/${channel.slug}`}
            className="block text-pretty text-sm font-semibold leading-snug text-fg transition-colors duration-150 line-clamp-1 hover:text-brand-2"
            title={channel.title}
          >
            {channel.title}
          </Link>
          <p className="truncate text-sm text-muted">{channel.displayName}</p>
          <p className="truncate text-sm text-brand-2/90">{channel.category}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {channel.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ink-3 px-2 py-0.5 text-[11px] text-muted ring-1 ring-edge/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
