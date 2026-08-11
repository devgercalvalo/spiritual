"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/lib/cart/cart-context";

export function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/carrito"
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-purple-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      aria-label="Ver carrito"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-700 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
