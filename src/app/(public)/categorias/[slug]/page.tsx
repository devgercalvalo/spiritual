import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryFilter } from "@/components/public/category-filter";
import { PostCard } from "@/components/public/post-card";
import { getCategories, getCategoryBySlug, getPublishedPosts } from "@/lib/data/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Publicaciones de la categoría ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [posts, categories] = await Promise.all([
    getPublishedPosts({ categorySlug: slug }),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">{category.description}</p>
        )}
      </div>
      <CategoryFilter categories={categories} activeSlug={slug} />
      {posts.length === 0 ? (
        <p className="text-neutral-500">Todavía no hay publicaciones en esta categoría.</p>
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
