import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/public/product-card";
import { getKitBySlug } from "@/lib/data/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);
  if (!kit) return {};
  return { title: kit.name, description: kit.description ?? undefined };
}

export default async function KitPage({ params }: Props) {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);
  if (!kit) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-purple-50 dark:bg-purple-950/20">
          {kit.image_url ? (
            <Image src={kit.image_url} alt={kit.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">🧿</div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl font-bold">{kit.name}</h1>
          {kit.description && <p className="text-neutral-600 dark:text-neutral-400">{kit.description}</p>}
        </div>
      </div>

      {kit.products.length > 0 && (
        <div>
          <h2 className="font-display mb-4 text-xl font-semibold">Incluye</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {kit.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
