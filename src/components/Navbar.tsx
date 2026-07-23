import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b border-edge bg-ink-2 px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-lg">▶</span>
          <span className="hidden text-lg sm:block">
            Stream<span className="text-brand-2">Live</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-white">Explorar</Link>
          <Link href="/browse" className="hover:text-white">Categorías</Link>
          {session && (
            <Link href="/following" className="hover:text-white">Siguiendo</Link>
          )}
        </nav>
      </div>

      <SearchBar />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/studio"
          className="hidden rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-2 sm:block"
        >
          Emitir
        </Link>
        {session ? (
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: session.color }}
              title={`${session.username} · ${session.role}`}
            >
              {session.username.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm font-semibold md:block">{session.username}</span>
            <form action={logoutAction}>
              <button className="rounded-md bg-ink-3 px-3 py-1.5 text-sm text-muted transition hover:text-white">
                Salir
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-ink-3 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-edge"
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
