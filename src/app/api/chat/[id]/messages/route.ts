import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { chatMessageSchema } from "@/lib/validations/chat";

type Params = { params: Promise<{ id: string }> };

/**
 * Réplica del visitante a un hilo que ya conoce (mismo modelo de "posesión del
 * id" que GET /api/chat/[id] — ver ese archivo). Usamos la service role key
 * para poder confirmar que el hilo existe y no está cerrado antes de insertar.
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Hilo no encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Honeypot: si el campo trampa viene lleno, es un bot — respondemos "ok" sin insertar.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceRoleClient();

  const { data: thread, error: threadError } = await supabase
    .from("chat_threads")
    .select("id, status, customer_name")
    .eq("id", id)
    .maybeSingle();

  if (threadError || !thread) {
    return NextResponse.json({ error: "Hilo no encontrado" }, { status: 404 });
  }
  if (thread.status === "closed") {
    return NextResponse.json({ error: "Este hilo ya está cerrado" }, { status: 409 });
  }

  const { error: messageError } = await supabase.from("chat_messages").insert({
    thread_id: id,
    sender_type: "customer",
    sender_name: thread.customer_name,
    content: parsed.data.content,
  });

  if (messageError) {
    return NextResponse.json({ error: "No se pudo enviar tu mensaje" }, { status: 500 });
  }

  if (thread.status === "answered") {
    await supabase.from("chat_threads").update({ status: "open" }).eq("id", id);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
