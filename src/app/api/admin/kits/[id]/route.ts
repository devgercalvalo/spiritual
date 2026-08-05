import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { kitSchema } from "@/lib/validations/catalog";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = kitSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { product_ids, ...kitValues } = parsed.data;

  const { data, error } = await auth.supabase.from("kits").update(kitValues).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (product_ids) {
    await auth.supabase.from("kit_products").delete().eq("kit_id", id);
    if (product_ids.length > 0) {
      await auth.supabase
        .from("kit_products")
        .insert(product_ids.map((product_id) => ({ kit_id: id, product_id })));
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const { error } = await auth.supabase.from("kits").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
