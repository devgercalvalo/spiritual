"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/database.types";

type CommentRow = Comment & { posts: { title: string; slug: string } | null };

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
} as const;

const statusLabel = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
} as const;

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/admin/comments")
      .then((res) => res.json())
      .then((json) => setComments(json.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este comentario?")) return;
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Comentarios</h1>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay comentarios todavía.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Autor</TableHead>
              <TableHead>Comentario</TableHead>
              <TableHead>Publicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">{comment.author_name}</TableCell>
                <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                <TableCell>
                  {comment.posts && (
                    <Link href={`/blog/${comment.posts.slug}`} className="text-purple-700 hover:underline">
                      {comment.posts.title}
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[comment.status]}>{statusLabel[comment.status]}</Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatDate(comment.created_at)}</TableCell>
                <TableCell className="flex justify-end gap-2 text-right">
                  {comment.status !== "approved" && (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus(comment.id, "approved")}>
                      <Check className="h-4 w-4 text-emerald-600" />
                    </Button>
                  )}
                  {comment.status !== "rejected" && (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus(comment.id, "rejected")}>
                      <X className="h-4 w-4 text-amber-600" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(comment.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
