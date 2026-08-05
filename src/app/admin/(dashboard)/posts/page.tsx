"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Category, Post } from "@/types/database.types";

type PostRow = Post & { categories: Category | null };

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/posts")
      .then((res) => res.json())
      .then((json) => setPosts(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta publicación?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Publicaciones</h1>
        <Button asChild>
          <Link href="/admin/posts/nuevo">
            <Plus className="h-4 w-4" />
            Nueva publicación
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no hay publicaciones.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.categories?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "success" : "secondary"}>
                    {post.status === "published" ? "Publicado" : "Borrador"}
                  </Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatDate(post.created_at)}</TableCell>
                <TableCell className="flex justify-end gap-3 text-right">
                  <Link href={`/admin/posts/${post.id}`} className="text-purple-700 hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
