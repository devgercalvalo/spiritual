"use client";

import Image from "next/image";
import { ExternalLink, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/database.types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="240px" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🕊️</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{product.name}</h4>
        {product.description && (
          <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-purple-700">
            {product.price_display ?? (product.price > 0 ? formatCurrency(product.price) : null)}
          </span>
          <div className="flex gap-2">
            {product.price > 0 && (
              <Button
                size="sm"
                onClick={() =>
                  addItem({
                    item_type: "product",
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                  })
                }
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Agregar
              </Button>
            )}
            {product.mercado_libre_url && (
              <Button asChild size="sm" variant="secondary">
                <a href={product.mercado_libre_url} target="_blank" rel="noopener noreferrer">
                  Comprar
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
