import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/post-form";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/database.types";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: post }, { data: categories }, { data: kits }] = await Promise.all([
    supabase.from("posts").select("*, post_kits(kit_id)").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("kits").select("*").eq("is_active", true).order("name"),
  ]);

  if (!post) notFound();

  const { post_kits, ...postValues } = post as Post & { post_kits: { kit_id: string }[] };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Editar publicación</h1>
      <PostForm
        postId={id}
        categories={categories ?? []}
        kits={kits ?? []}
        initialValues={{
          ...postValues,
          excerpt: postValues.excerpt ?? "",
          cover_image_url: postValues.cover_image_url ?? "",
          seo_title: postValues.seo_title ?? "",
          seo_description: postValues.seo_description ?? "",
          kit_ids: post_kits?.map((pk) => pk.kit_id) ?? [],
        }}
      />
    </div>
  );
}
