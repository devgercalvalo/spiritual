"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  item_type: "product" | "kit";
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (item_type: CartItem["item_type"], id: string, quantity: number) => void;
  removeItem: (item_type: CartItem["item_type"], id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "sanacion-san-charbel:cart";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratar desde localStorage después del montaje: en el servidor no existe
    // localStorage, así que la primera pasada siempre renderiza el carrito vacío
    // (evita un mismatch de hydration) y aquí se sincroniza con lo guardado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStoredCart()); setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
      setItems((prev) => {
        const existing = prev.find((i) => i.item_type === item.item_type && i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.item_type === item.item_type && i.id === item.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    }

    function updateQuantity(item_type: CartItem["item_type"], id: string, quantity: number) {
      setItems((prev) =>
        quantity < 1
          ? prev.filter((i) => !(i.item_type === item_type && i.id === id))
          : prev.map((i) => (i.item_type === item_type && i.id === id ? { ...i, quantity } : i))
      );
    }

    function removeItem(item_type: CartItem["item_type"], id: string) {
      setItems((prev) => prev.filter((i) => !(i.item_type === item_type && i.id === id)));
    }

    function clear() {
      setItems([]);
    }

    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return { items, count, total, addItem, updateQuantity, removeItem, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
