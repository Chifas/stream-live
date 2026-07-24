"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/client";
import { SunIcon, MoonIcon } from "./icons";

export function ThemeToggle() {
  const t = useT();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as "dark" | "light") || "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("sl_theme", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
      title={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
      className="grid size-8 place-items-center rounded-md bg-ink-3 text-muted transition-colors hover:text-fg"
    >
      {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  );
}
