"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  initial = "",
  placeholder = "Buscar canales, categorías…",
}: {
  initial?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submit} className="flex max-w-md flex-1 items-center" role="search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-l-md border border-edge bg-ink-3 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-brand"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="rounded-r-md border border-l-0 border-edge bg-ink-3 px-3 py-2 text-muted hover:text-white"
      >
        🔍
      </button>
    </form>
  );
}
