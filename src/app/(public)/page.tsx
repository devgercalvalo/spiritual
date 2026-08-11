import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PostCard } from "@/components/public/post-card";
import { Button } from "@/components/ui/button";
import { getFeaturedKits, getPublishedPosts } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function HomePage() {
  const [posts, kits] = await Promise.all([
    getPublishedPosts({ limit: 6 }),
    getFeaturedKits(3),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-amber-300/30 blur-2xl dark:bg-amber-500/10" />
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-amber-300/80 ring-offset-4 ring-offset-neutral-50 sm:h-36 sm:w-36 dark:ring-amber-500/50 dark:ring-offset-neutral-950">
            <Image
              src="/images/san-charbel.jpg"
              alt="San Charbel Makhlouf"
              fill
              priority
              className="object-cover"
              sizes="144px"
            />
          </div>
        </div>
        <span className="text-sm font-medium uppercase tracking-widest text-purple-600 dark:text-amber-400">
          Bajo la intercesión de San Charbel Makhlouf
        </span>
        <h1 className="font-display max-w-2xl text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-neutral-100">
          Oraciones, rituales y sabiduría para tu camino
        </h1>
        <p className="max-w-xl text-neutral-600 dark:text-neutral-400">
          Reflexiones, mensajes y consejos espirituales, junto con los kits recomendados para
          practicar cada ritual en casa.
        </p>
        <Button asChild size="lg">
          <Link href="/blog">Explorar el blog</Link>
        </Button>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Publicaciones recientes</h2>
          <Link href="/blog" className="text-sm font-medium text-purple-700 hover:underline">
            Ver todas
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-neutral-500">Todavía no hay publicaciones. Vuelve pronto ✨</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {kits.length > 0 && (
        <section className="flex flex-col gap-6 rounded-2xl bg-purple-50 p-8 dark:bg-purple-950/20">
          <h2 className="font-display text-2xl font-semibold">Kits destacados</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {kits.map((kit) => (
              <Link
                key={kit.id}
                href={`/kits/${kit.slug}`}
                className="rounded-xl border border-purple-200 bg-white p-5 transition hover:shadow-md dark:border-purple-900/40 dark:bg-neutral-900"
              >
                <h3 className="font-display font-semibold">{kit.name}</h3>
                {kit.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {kit.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
