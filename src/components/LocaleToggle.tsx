"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/client";
import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "@/i18n/dictionaries";

export function LocaleToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo() {
    const next: Locale = locale === "es" ? "en" : "es";
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <button
      onClick={switchTo}
      disabled={pending}
      aria-label="Idioma / Language"
      title="Idioma / Language"
      className="grid h-8 w-9 place-items-center rounded-md bg-ink-3 text-xs font-bold text-muted transition hover:text-fg disabled:opacity-50"
    >
      {locale.toUpperCase()}
    </button>
  );
}
