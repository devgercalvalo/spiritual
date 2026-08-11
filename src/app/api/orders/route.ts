import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/order";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Honeypot: si el campo trampa viene lleno, es un bot — respondemos "ok" sin insertar.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, order_id: crypto.randomUUID(), total: 0 });
  }

  const { customer_name, customer_email, customer_phone, customer_notes, items } = parsed.data;

  const supabase = await createClient();

  // Nunca confiar en el precio que manda el cliente: se relee de la base al
  // momento de armar el pedido.
  const productIds = items.filter((i) => i.item_type === "product").map((i) => i.id);
  const kitIds = items.filter((i) => i.item_type === "kit").map((i) => i.id);

  const [{ data: products, error: productsError }, { data: kits, error: kitsError }] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("id, name, price").in("id", productIds).eq("is_active", true)
      : Promise.resolve({ data: [], error: null }),
    kitIds.length
      ? supabase.from("kits").select("id, name, price").in("id", kitIds).eq("is_active", true)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (productsError || kitsError) {
    return NextResponse.json({ error: "No se pudieron validar los productos del pedido" }, { status: 500 });
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const kitMap = new Map((kits ?? []).map((k) => [k.id, k]));

  const orderItems = [];
  for (const item of items) {
    const catalogItem = item.item_type === "product" ? productMap.get(item.id) : kitMap.get(item.id);
    if (!catalogItem) {
      return NextResponse.json(
        { error: "Uno de los productos del carrito ya no está disponible" },
        { status: 400 }
      );
    }
    const subtotal = Number((catalogItem.price * item.quantity).toFixed(2));
    orderItems.push({
      item_type: item.item_type,
      product_id: item.item_type === "product" ? item.id : null,
      kit_id: item.item_type === "kit" ? item.id : null,
      name: catalogItem.name,
      unit_price: catalogItem.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  const total = Number(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  const orderId = crypto.randomUUID();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    customer_name,
    customer_email,
    customer_phone: customer_phone || null,
    customer_notes: customer_notes || null,
    status: "pending",
    total,
  });

  if (orderError) {
    return NextResponse.json({ error: "No se pudo guardar el pedido" }, { status: 500 });
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: orderId })));

  if (itemsError) {
    return NextResponse.json({ error: "No se pudo guardar el pedido" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, order_id: orderId, total }, { status: 201 });
}
