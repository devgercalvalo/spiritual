import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Category } from "@/types/database.types";

export function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm transition",
          !activeSlug
            ? "border-purple-700 bg-purple-700 text-white"
            : "border-neutral-300 text-neutral-600 hover:border-purple-400 dark:border-neutral-700 dark:text-neutral-300"
        )}
      >
        Todas
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categorias/${category.slug}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition",
            activeSlug === category.slug
              ? "border-purple-700 bg-purple-700 text-white"
              : "border-neutral-300 text-neutral-600 hover:border-purple-400 dark:border-neutral-700 dark:text-neutral-300"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
