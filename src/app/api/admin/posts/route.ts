import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { postSchema } from "@/lib/validations/post";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("posts")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { kit_ids, ...postValues } = parsed.data;

  const { data: post, error } = await auth.supabase
    .from("posts")
    .insert({
      ...postValues,
      cover_image_url: postValues.cover_image_url || null,
      author_id: auth.user.id,
      published_at: postValues.status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (kit_ids && kit_ids.length > 0) {
    await auth.supabase
      .from("post_kits")
      .insert(kit_ids.map((kit_id) => ({ post_id: post.id, kit_id })));
  }

  return NextResponse.json({ data: post }, { status: 201 });
}
