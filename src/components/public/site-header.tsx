import Image from "next/image";
import Link from "next/link";

import { CartButton } from "@/components/public/cart-button";
import { SearchBar } from "@/components/public/search-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/60 bg-white/90 backdrop-blur dark:border-amber-900/30 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 font-display text-xl font-semibold text-purple-800 dark:text-purple-200">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/80">
              <Image src="/images/san-charbel.jpg" alt="San Charbel Makhlouf" fill className="object-cover" sizes="36px" />
            </span>
            Centro de Sanación San Charbel
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-600 sm:flex dark:text-neutral-300">
            <Link href="/blog" className="hover:text-purple-700">Blog</Link>
            <Link href="/categorias/oraciones" className="hover:text-purple-700">Oraciones</Link>
            <Link href="/categorias/rituales" className="hover:text-purple-700">Rituales</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
