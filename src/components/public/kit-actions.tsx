"use client";

import { ShoppingCart } from "lucide-react";

import { ChatWidget } from "@/components/public/chat-widget";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import type { Kit } from "@/types/database.types";

export function KitActions({ kit }: { kit: Kit }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-wrap gap-3">
      {kit.price > 0 && (
        <Button
          size="lg"
          onClick={() =>
            addItem({
              item_type: "kit",
              id: kit.id,
              slug: kit.slug,
              name: kit.name,
              price: kit.price,
              image_url: kit.image_url,
            })
          }
        >
          <ShoppingCart className="h-4 w-4" />
          Agregar al carrito
        </Button>
      )}
      <ChatWidget kitId={kit.id} subject={kit.name} promptLabel="Preguntar por este kit" />
    </div>
  );
}
