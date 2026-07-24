"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./icons";

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
    <form onSubmit={submit} className="flex max-w-md flex-1" role="search">
      <div className="flex w-full items-center rounded-md border border-edge bg-ink-3 pl-3 pr-1.5 transition-colors focus-within:border-brand">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted focus:outline-none focus-visible:outline-none"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="grid size-7 shrink-0 place-items-center rounded text-muted transition-colors hover:text-fg focus:outline-none focus-visible:outline-none"
        >
          <SearchIcon className="size-4" />
        </button>
      </div>
    </form>
  );
}
