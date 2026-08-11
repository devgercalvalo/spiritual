"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart/cart-context";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order";
import { formatCurrency } from "@/lib/utils";

const customerFieldsSchema = checkoutSchema.omit({ items: true, website: true });
type CustomerFieldsInput = Omit<CheckoutInput, "items" | "website">;

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clear } = useCart();
  const [confirmation, setConfirmation] = useState<{ orderId: string; total: number } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFieldsInput>({
    resolver: zodResolver(customerFieldsSchema),
    defaultValues: { customer_name: "", customer_email: "", customer_phone: "", customer_notes: "" },
  });

  async function onSubmit(values: CustomerFieldsInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((item) => ({ item_type: item.item_type, id: item.id, quantity: item.quantity })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo enviar tu pedido");
      setConfirmation({ orderId: json.order_id, total: json.total });
      clear();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo enviar tu pedido");
    }
  }

  if (confirmation) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
        <h1 className="font-display text-2xl font-semibold text-emerald-800 dark:text-emerald-300">
          ¡Pedido recibido!
        </h1>
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          Tu folio es <span className="font-mono font-semibold">{confirmation.orderId.slice(0, 8)}</span> por un
          total de {formatCurrency(confirmation.total)}. Nos pondremos en contacto contigo para confirmar el pago
          y la entrega.
        </p>
        <Link href="/" className="text-sm font-medium text-purple-700 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Tu carrito está vacío</h1>
        <p className="text-sm text-neutral-500">Explora nuestros productos y kits para empezar tu pedido.</p>
        <Link href="/" className="text-sm font-medium text-purple-700 hover:underline">
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-semibold">Tu carrito</h1>
        {items.map((item) => (
          <div
            key={`${item.item_type}-${item.id}`}
            className="flex items-center gap-4 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full items-center justify-center text-xl">{item.item_type === "kit" ? "🧿" : "🕊️"}</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-neutral-500">{formatCurrency(item.price)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.item_type, item.id, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                aria-label="Quitar uno"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.item_type, item.id, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                aria-label="Agregar uno"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.item_type, item.id)}
              className="text-red-600 hover:text-red-700"
              aria-label="Quitar del carrito"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-lg font-semibold dark:border-neutral-800">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-fit flex-col gap-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
      >
        <h2 className="font-display text-lg font-semibold">Datos de contacto</h2>
        <p className="text-sm text-neutral-500">
          No se cobra en línea todavía: al enviar tu pedido, nuestro equipo te contactará para acordar el pago y
          la entrega.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input {...register("customer_name")} />
          {errors.customer_name && <p className="text-xs text-red-600">{errors.customer_name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Correo</Label>
          <Input type="email" {...register("customer_email")} />
          {errors.customer_email && <p className="text-xs text-red-600">{errors.customer_email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Teléfono (opcional)</Label>
          <Input {...register("customer_phone")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Notas para tu pedido (opcional)</Label>
          <Textarea rows={3} {...register("customer_notes")} placeholder="Ej. dirección de envío, horario de contacto…" />
        </div>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : "Enviar pedido"}
        </Button>
      </form>
    </div>
  );
}
