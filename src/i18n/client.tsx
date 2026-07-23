"use client";

import { createContext, useContext } from "react";
import type { Locale, Messages } from "./dictionaries";

interface I18nValue {
  locale: Locale;
  messages: Messages;
}

const I18nContext = createContext<I18nValue>({ locale: "es", messages: {} });

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>;
}

/** Hook de traducción para client components. */
export function useT() {
  const { messages } = useContext(I18nContext);
  return (key: string) => messages[key] ?? key;
}

export function useLocale() {
  return useContext(I18nContext).locale;
}
