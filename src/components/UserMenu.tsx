"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { useT } from "@/i18n/client";
import type { Role } from "@/lib/types";
import { ChevronDownIcon, SlidersIcon, BroadcastIcon, HeartIcon, LogOutIcon } from "./icons";

export function UserMenu({
  username,
  color,
  role,
}: {
  username: string;
  color: string;
  role: Role;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2"
        title={`${username} · ${role}`}
      >
        <span
          className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {username.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-sm font-semibold md:block">{username}</span>
        <ChevronDownIcon className="size-4 text-muted" />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-edge bg-ink-2 py-1 shadow-xl"
          >
            <div className="border-b border-edge px-3 py-2">
              <p className="truncate text-sm font-semibold">{username}</p>
              <p className="text-xs capitalize text-muted">{role}</p>
            </div>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-ink-3">
              <SlidersIcon className="size-4 text-muted" /> {t("menu.dashboard")}
            </Link>
            <Link href="/studio" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-ink-3">
              <BroadcastIcon className="size-4 text-muted" /> {t("menu.studio")}
            </Link>
            <Link href="/following" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-ink-3">
              <HeartIcon className="size-4 text-muted" /> {t("nav.following")}
            </Link>
            <form action={logoutAction} className="border-t border-edge">
              <button className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-muted hover:bg-ink-3 hover:text-fg">
                <LogOutIcon className="size-4" /> {t("nav.logout")}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
