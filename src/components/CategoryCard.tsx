import Link from "next/link";
import Image from "next/image";
import { formatViewers } from "@/lib/format";

/** Hue estable a partir del nombre, para dar un color propio a cada categoría. */
function hueOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export function CategoryCard({
  name,
  coverUrl,
  viewers,
  href,
}: {
  name: string;
  coverUrl: string;
  viewers: number;
  href: string;
}) {
  const hue = hueOf(name);
  return (
    <Link href={href} className="group block">
      <div className="lift relative aspect-[3/4] overflow-hidden rounded-xl2 ring-1 ring-edge/70">
        <Image
          src={coverUrl}
          alt={name}
          width={480}
          height={640}
          unoptimized
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Tinte de color por categoría + degradado para el texto. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, hsl(${hue} 65% 22% / 0.92) 0%, hsl(${hue} 65% 22% / 0.15) 45%, transparent 75%)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-sm font-bold text-white">{name}</p>
          <p className="text-xs tabular-nums text-white/70">{formatViewers(viewers)} esp.</p>
        </div>
      </div>
    </Link>
  );
}
