import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { newThreadSchema } from "@/lib/validations/chat";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = newThreadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Honeypot: si el campo trampa viene lleno, es un bot — respondemos "ok" sin insertar.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, thread_id: crypto.randomUUID() });
  }

  const { customer_name, customer_email, customer_phone, product_id, kit_id, subject, content } = parsed.data;

  const supabase = await createClient();
  const threadId = crypto.randomUUID();

  const { error: threadError } = await supabase.from("chat_threads").insert({
    id: threadId,
    customer_name,
    customer_email,
    customer_phone: customer_phone || null,
    product_id: product_id || null,
    kit_id: kit_id || null,
    subject: subject || null,
    status: "open",
  });

  if (threadError) {
    return NextResponse.json({ error: "No se pudo enviar tu mensaje" }, { status: 500 });
  }

  const { error: messageError } = await supabase.from("chat_messages").insert({
    thread_id: threadId,
    sender_type: "customer",
    sender_name: customer_name,
    content,
  });

  if (messageError) {
    return NextResponse.json({ error: "No se pudo enviar tu mensaje" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, thread_id: threadId }, { status: 201 });
}
