import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, getMessages, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "sl_locale";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value as Locale | undefined;
  return value && LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

/** Devuelve una función de traducción para el idioma activo (server components). */
export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale();
  const messages = getMessages(locale);
  return (key: string) => messages[key] ?? key;
}
