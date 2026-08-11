import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";

type Params = { params: Promise<{ id: string }> };

const replySchema = z.object({ content: z.string().min(1, "Escribe un mensaje").max(2000) });

export async function POST(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("full_name")
    .eq("id", auth.user.id)
    .single();

  const { data, error } = await auth.supabase
    .from("chat_messages")
    .insert({
      thread_id: id,
      sender_type: "admin",
      sender_name: profile?.full_name || "Equipo San Charbel",
      content: parsed.data.content,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await auth.supabase.from("chat_threads").update({ status: "answered" }).eq("id", id);

  return NextResponse.json({ data }, { status: 201 });
}
