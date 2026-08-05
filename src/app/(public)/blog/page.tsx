import type { Metadata } from "next";

import { CategoryFilter } from "@/components/public/category-filter";
import { PostCard } from "@/components/public/post-card";
import { getCategories, getPublishedPosts } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Blog",
  description: "Oraciones, rituales, reflexiones y mensajes espirituales.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Blog</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Oraciones, rituales, reflexiones y mensajes espirituales.
        </p>
      </div>
      <CategoryFilter categories={categories} />
      {posts.length === 0 ? (
        <p className="text-neutral-500">Todavía no hay publicaciones.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
