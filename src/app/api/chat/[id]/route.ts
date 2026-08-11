import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceRoleClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

/**
 * Lectura del hilo de chat por parte del visitante. No hay policy de RLS
 * pública para esto (expondría todos los hilos, ver migración de RLS) — en vez
 * de eso usamos la service role key y SIEMPRE filtramos por el id exacto de la
 * URL. El modelo de seguridad es "quien tiene el UUID del hilo puede verlo",
 * igual que un link para compartir; esta ruta nunca debe listar varios hilos.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Hilo no encontrado" }, { status: 404 });
  }

  const supabase = createServiceRoleClient();

  const { data: thread, error: threadError } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (threadError || !thread) {
    return NextResponse.json({ error: "Hilo no encontrado" }, { status: 404 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: "No se pudo cargar la conversación" }, { status: 500 });
  }

  return NextResponse.json({ data: { thread, messages: messages ?? [] } });
}
