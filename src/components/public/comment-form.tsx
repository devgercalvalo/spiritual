"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { commentSchema, type CommentInput } from "@/lib/validations/comment";

export function CommentForm({ postId }: { postId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { post_id: postId, author_name: "", author_email: "", content: "", website: "" },
  });

  async function onSubmit(values: CommentInput) {
    setState("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("request failed");
      setState("success");
      reset({ post_id: postId, author_name: "", author_email: "", content: "", website: "" });
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
        ¡Gracias por tu comentario! Se publicará en cuanto sea revisado.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {/* honeypot anti-spam, oculto para personas */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input placeholder="Tu nombre" {...register("author_name")} />
          {errors.author_name && <p className="mt-1 text-xs text-red-600">{errors.author_name.message}</p>}
        </div>
        <div>
          <Input placeholder="Tu correo (no se publica)" type="email" {...register("author_email")} />
          {errors.author_email && <p className="mt-1 text-xs text-red-600">{errors.author_email.message}</p>}
        </div>
      </div>
      <div>
        <Textarea placeholder="Escribe tu comentario…" {...register("content")} />
        {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
      </div>
      {state === "error" && (
        <p className="text-sm text-red-600">Hubo un problema al enviar tu comentario. Intenta de nuevo.</p>
      )}
      <Button type="submit" disabled={state === "loading"} className="w-fit">
        {state === "loading" ? "Enviando…" : "Comentar"}
      </Button>
    </form>
  );
}
