"use client";

import { ShoppingCart } from "lucide-react";

import { ChatWidget } from "@/components/public/chat-widget";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import type { Product } from "@/types/database.types";

export function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-wrap gap-3">
      {product.price > 0 && (
        <Button
          size="lg"
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
          <ShoppingCart className="h-4 w-4" />
          Agregar al carrito
        </Button>
      )}
      <ChatWidget productId={product.id} subject={product.name} promptLabel="Preguntar por este producto" />
    </div>
  );
}
