import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Kit } from "@/types/database.types";

export function KitRecommendation({ kit }: { kit: Kit }) {
  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white/60">
        {kit.image_url ? (
          <Image src={kit.image_url} alt={kit.name} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🧿</div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Kit recomendado para este ritual
        </p>
        <h4 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {kit.name}
        </h4>
        {kit.description && (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{kit.description}</p>
        )}
      </div>
      <Button asChild>
        <Link href={`/kits/${kit.slug}`}>
          <ShoppingBag className="h-4 w-4" />
          Ver kit
        </Link>
      </Button>
    </aside>
  );
}
