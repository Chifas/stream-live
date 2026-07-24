import Link from "next/link";

type TabKey = "live" | "about" | "vod";

const TABS: { key: TabKey; label: string; href: (s: string) => string }[] = [
  { key: "live", label: "Directo", href: (s) => `/channel/${s}` },
  { key: "about", label: "Sobre el canal", href: (s) => `/channel/${s}/about` },
  { key: "vod", label: "Vídeos", href: (s) => `/channel/${s}/vod` },
];

/** Pestañas de sección del canal (estilo Twitch). */
export function ChannelTabs({ slug, active }: { slug: string; active: TabKey }) {
  return (
    <nav aria-label="Secciones del canal" className="flex gap-1 border-b border-edge">
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href(slug)}
            aria-current={on ? "page" : undefined}
            className={`relative px-3 py-2.5 text-sm font-semibold transition-colors ${
              on ? "text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
            {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
          </Link>
        );
      })}
    </nav>
  );
}
