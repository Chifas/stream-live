import Link from "next/link";
import { getSession } from "@/lib/session";
import { getT } from "@/i18n/server";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";
import { UserMenu } from "./UserMenu";
import { PlayIcon, BroadcastIcon } from "./icons";

export async function Navbar() {
  const session = await getSession();
  const t = await getT();

  return (
    <header className="glass sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b border-edge/70 px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="btn-brand grid size-8 place-items-center rounded-lg shadow-none">
            <PlayIcon className="size-4" />
          </span>
          <span className="hidden text-lg sm:block">
            Stream<span className="text-brand-2">Live</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-4 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-white">{t("nav.explore")}</Link>
          <Link href="/browse" className="hover:text-white">{t("nav.categories")}</Link>
          {session && (
            <Link href="/following" className="hover:text-white">{t("nav.following")}</Link>
          )}
        </nav>
      </div>

      <SearchBar placeholder={t("nav.search")} />

      <div className="flex items-center gap-2">
        <LocaleToggle />
        <ThemeToggle />
        <Link
          href="/studio"
          className="btn-brand hidden items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold sm:flex"
        >
          <BroadcastIcon className="size-4" />
          {t("nav.golive")}
        </Link>
        {session ? (
          <UserMenu username={session.username} color={session.color} role={session.role} />
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-ink-3 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-edge"
          >
            {t("nav.login")}
          </Link>
        )}
      </div>
    </header>
  );
}
