import { createClient } from "@/lib/supabase/server";
import type { Category, Comment, Kit, Post, Product } from "@/types/database.types";

export type PostWithCategory = Post & { categories: Category | null };
export type PostWithKits = PostWithCategory & { kits: Kit[] };

export async function getPublishedPosts(options?: {
  categorySlug?: string;
  search?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*, categories(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (category) query = query.eq("category_id", category.id);
  }

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`);
  }

  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PostWithCategory[];
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(*), post_kits(kits(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { post_kits, ...post } = data as unknown as PostWithCategory & {
    post_kits: { kits: Kit }[];
  };

  return { ...post, kits: post_kits?.map((pk) => pk.kits).filter(Boolean) ?? [] } as PostWithKits;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data as Category[];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Category | null;
}

export async function getApprovedComments(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Comment[];
}

export async function getFeaturedKits(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kits")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Kit[];
}

export async function getKitBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kits")
    .select("*, kit_products(products(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { kit_products, ...kit } = data as unknown as Kit & { kit_products: { products: Product }[] };
  return { ...kit, products: kit_products?.map((kp) => kp.products).filter(Boolean) ?? [] };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}
