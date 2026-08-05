import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { kitSchema } from "@/lib/validations/catalog";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("kits")
    .select("*, kit_products(product_id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = kitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { product_ids, ...kitValues } = parsed.data;

  const { data: kit, error } = await auth.supabase
    .from("kits")
    .insert({ ...kitValues, image_url: kitValues.image_url || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (product_ids && product_ids.length > 0) {
    await auth.supabase
      .from("kit_products")
      .insert(product_ids.map((product_id) => ({ kit_id: kit.id, product_id })));
  }

  return NextResponse.json({ data: kit }, { status: 201 });
}
