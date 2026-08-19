import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/ui/badge";
import { CommentForm } from "@/components/public/comment-form";
import { CommentList } from "@/components/public/comment-list";
import { KitRecommendation } from "@/components/public/kit-recommendation";
import { ShareButtons } from "@/components/public/share-buttons";
import { formatDate, getSiteUrl } from "@/lib/utils";
import { getApprovedComments, getPostBySlug } from "@/lib/data/public";

type Props = { params: Promise<{ slug: string }> };

const siteUrl = getSiteUrl();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const comments = await getApprovedComments(post.id);
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    mainEntityOfPage: postUrl,
  };

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="flex flex-col gap-3">
        {post.categories && (
          <Link href={`/categorias/${post.categories.slug}`}>
            <Badge variant="secondary">{post.categories.name}</Badge>
          </Link>
        )}
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <div className="flex items-center justify-between">
          {post.published_at && (
            <span className="text-sm text-neutral-500">{formatDate(post.published_at)}</span>
          )}
          <ShareButtons url={postUrl} title={post.title} />
        </div>
      </header>

      {post.cover_image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="prose-spiritual">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      {post.kits.map((kit) => (
        <KitRecommendation key={kit.id} kit={kit} />
      ))}

      <section className="flex flex-col gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="font-display text-xl font-semibold">
          Comentarios ({comments.length})
        </h2>
        <CommentList comments={comments} />
        <div className="mt-2">
          <h3 className="mb-2 text-sm font-medium">Deja tu comentario</h3>
          <CommentForm postId={post.id} />
        </div>
      </section>
    </article>
  );
}
