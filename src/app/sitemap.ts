import type { MetadataRoute } from "next";

import { getCategories, getPublishedPosts } from "@/lib/data/public";
import { getSiteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()]);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/blog", "/buscar"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categorias/${category.slug}`,
    lastModified: category.created_at,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
