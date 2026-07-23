import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b border-edge bg-ink-2 px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-lg">
            ▶
          </span>
          <span className="hidden text-lg sm:block">
            Stream<span className="text-brand-2">Live</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-white">Explorar</Link>
          <Link href="/browse" className="hover:text-white">Categorías</Link>
        </nav>
      </div>

      <div className="flex max-w-md flex-1 items-center">
        <input
          type="search"
          placeholder="Buscar canales, categorías…"
          className="w-full rounded-l-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-brand"
        />
        <button className="rounded-r-md border border-l-0 border-edge bg-ink-3 px-3 py-2 text-muted hover:text-white">
          🔍
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/studio"
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-2"
        >
          Emitir
        </Link>
        <div className="grid h-8 w-8 place-items-center rounded-full bg-ink-3 text-sm">
          👤
        </div>
      </div>
    </header>
  );
}
