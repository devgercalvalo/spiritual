import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { postSchema } from "@/lib/validations/post";
import type { Database } from "@/types/database.types";

type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const { data, error } = await auth.supabase
    .from("posts")
    .select("*, categories(*), post_kits(kit_id)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = postSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { kit_ids, ...postValues } = parsed.data;

  const updatePayload: PostUpdate = { ...postValues };
  if (postValues.cover_image_url !== undefined) {
    updatePayload.cover_image_url = postValues.cover_image_url || null;
  }
  if (postValues.status === "published") {
    const { data: existing } = await auth.supabase
      .from("posts")
      .select("published_at")
      .eq("id", id)
      .single();
    if (!existing?.published_at) updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await auth.supabase
    .from("posts")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (kit_ids) {
    await auth.supabase.from("post_kits").delete().eq("post_id", id);
    if (kit_ids.length > 0) {
      await auth.supabase
        .from("post_kits")
        .insert(kit_ids.map((kit_id) => ({ post_id: id, kit_id })));
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const { error } = await auth.supabase.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
