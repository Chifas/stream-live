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
        <div className="relative overflow-hidden rounded-md">
          <Image
            src={channel.thumbnailUrl}
            alt={channel.title}
            width={640}
            height={360}
            unoptimized
            className="aspect-video w-full object-cover transition group-hover:brightness-110"
          />
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[11px] font-bold uppercase text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white live-dot" /> {t("card.live")}
          </span>
          <span className="absolute bottom-2 left-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {formatViewers(channel.baseViewers)} {t("card.viewers")}
          </span>
        </div>
      </Link>

      <div className="mt-2 flex gap-2">
        <Link href={`/channel/${channel.slug}`} className="shrink-0">
          <Image
            src={channel.avatarUrl}
            alt={channel.displayName}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-full bg-ink-3"
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/channel/${channel.slug}`}
            className="block truncate text-sm font-semibold text-white hover:text-brand-2"
            title={channel.title}
          >
            {channel.title}
          </Link>
          <p className="truncate text-sm text-muted">{channel.displayName}</p>
          <p className="truncate text-sm text-muted">{channel.category}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {channel.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-ink-3 px-2 py-0.5 text-[11px] text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
