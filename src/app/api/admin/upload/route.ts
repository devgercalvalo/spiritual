import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "El archivo supera 5MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await auth.supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = auth.supabase.storage.from("media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
