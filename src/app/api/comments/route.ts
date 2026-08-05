import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { commentSchema } from "@/lib/validations/comment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Honeypot: si el campo trampa viene lleno, es un bot — respondemos "ok" sin insertar.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { post_id, author_name, author_email, content } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    post_id,
    author_name,
    author_email,
    content,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el comentario" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
