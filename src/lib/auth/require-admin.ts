import "server-only";

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Verifica que la request venga de un usuario autenticado con role='admin'.
 * Devuelve el cliente Supabase (ya autenticado, sujeto a RLS) o una respuesta
 * de error lista para retornar desde el Route Handler.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) } as const;
  }

  return { supabase, user } as const;
}
