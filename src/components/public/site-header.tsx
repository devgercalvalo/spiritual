import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SearchBar } from "@/components/public/search-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-purple-800 dark:text-purple-300">
            <Sparkles className="h-5 w-5" />
            Sendero Espiritual
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-600 sm:flex dark:text-neutral-300">
            <Link href="/blog" className="hover:text-purple-700">Blog</Link>
            <Link href="/categorias/oraciones" className="hover:text-purple-700">Oraciones</Link>
            <Link href="/categorias/rituales" className="hover:text-purple-700">Rituales</Link>
          </nav>
        </div>
        <SearchBar />
      </div>
    </header>
  );
}
