import type { Metadata } from "next";

import { PostCard } from "@/components/public/post-card";
import { SearchBar } from "@/components/public/search-bar";
import { getPublishedPosts } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Buscar",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const posts = q ? await getPublishedPosts({ search: q }) : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Buscar</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Encuentra oraciones, rituales y reflexiones.
        </p>
      </div>
      <SearchBar defaultValue={q} />
      {q && (
        <p className="text-sm text-neutral-500">
          {posts.length} resultado{posts.length === 1 ? "" : "s"} para “{q}”
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
