import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/data/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description ?? undefined };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🕊️</div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold">{product.name}</h1>
        {product.price_display && (
          <p className="text-xl font-semibold text-purple-700">{product.price_display}</p>
        )}
        {product.description && (
          <p className="text-neutral-600 dark:text-neutral-400">{product.description}</p>
        )}
        {product.mercado_libre_url && (
          <Button asChild size="lg" className="w-fit">
            <a href={product.mercado_libre_url} target="_blank" rel="noopener noreferrer">
              Comprar en Mercado Libre
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
