import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { PostWithCategory } from "@/lib/data/public";

export function PostCard({ post }: { post: PostWithCategory }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-purple-100 to-amber-50 dark:from-purple-950 dark:to-neutral-900">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🕯️</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.categories && <Badge variant="secondary">{post.categories.name}</Badge>}
        <h3 className="font-display text-lg font-semibold leading-snug text-neutral-900 group-hover:text-purple-700 dark:text-neutral-100">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{post.excerpt}</p>
        )}
        {post.published_at && (
          <p className="mt-auto pt-2 text-xs text-neutral-400">{formatDate(post.published_at)}</p>
        )}
      </div>
    </Link>
  );
}
