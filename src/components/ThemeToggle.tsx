"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as "dark" | "light") || "dark";
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
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title="Cambiar tema"
      className="grid h-8 w-8 place-items-center rounded-md bg-ink-3 text-sm text-muted transition hover:text-white"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
