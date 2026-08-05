import { PostForm } from "@/components/admin/post-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewPostPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: kits }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("kits").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Nueva publicación</h1>
      <PostForm categories={categories ?? []} kits={kits ?? []} />
    </div>
  );
}
