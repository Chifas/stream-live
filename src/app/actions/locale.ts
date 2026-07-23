"use server";

import { cookies } from "next/headers";
import { LOCALES, type Locale } from "@/i18n/dictionaries";
import { LOCALE_COOKIE } from "@/i18n/server";

export async function setLocaleAction(locale: Locale): Promise<void> {
  if (!LOCALES.includes(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
