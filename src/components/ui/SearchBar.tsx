"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar noticias..."
        className="w-full md:w-64 pl-4 pr-10 py-2 text-sm bg-background border border-border rounded-full text-foreground placeholder:text-muted-light focus:outline-none focus:border-gold transition-colors duration-200"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        aria-label="Buscar"
      >
        <svg
          className="w-4 h-4 text-muted hover:text-gold transition-colors duration-200"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
    </form>
  );
}
