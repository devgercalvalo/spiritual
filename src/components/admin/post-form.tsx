"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { postSchema, type PostInput } from "@/lib/validations/post";
import { slugify } from "@/lib/utils";
import type { Category, Kit } from "@/types/database.types";

export function PostForm({
  categories,
  kits,
  postId,
  initialValues,
}: {
  categories: Category[];
  kits: Kit[];
  postId?: string;
  initialValues?: Partial<PostInput>;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image_url: "",
      category_id: null,
      status: "draft",
      seo_title: "",
      seo_description: "",
      kit_ids: [],
      ...initialValues,
    },
  });

  const coverImageUrl = watch("cover_image_url");
  const selectedKitIds = watch("kit_ids") ?? [];

  async function onSubmit(values: PostInput) {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch(postId ? `/api/admin/posts/${postId}` : "/api/admin/posts", {
        method: postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.formErrors?.[0] || json.error || "No se pudo guardar");
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleKit(kitId: string) {
    const current = selectedKitIds;
    setValue(
      "kit_ids",
      current.includes(kitId) ? current.filter((id) => id !== kitId) : [...current, kitId]
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          {...register("title", {
            onChange: (e) => {
              if (!slugTouched) setValue("slug", slugify(e.target.value));
            },
          })}
        />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          {...register("slug", { onChange: () => setSlugTouched(true) })}
        />
        {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="excerpt">Extracto</Label>
        <Textarea id="excerpt" rows={2} {...register("excerpt")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Contenido (Markdown)</Label>
        <Textarea id="content" rows={16} className="font-mono text-sm" {...register("content")} />
        {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Categoría</Label>
          <Select
            defaultValue={initialValues?.category_id ?? undefined}
            onValueChange={(v) => setValue("category_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Estado</Label>
          <Select
            defaultValue={initialValues?.status ?? "draft"}
            onValueChange={(v) => setValue("status", v as PostInput["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Imagen de portada</Label>
        <ImageUploader value={coverImageUrl} onChange={(url) => setValue("cover_image_url", url)} />
      </div>

      {kits.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Kit(s) recomendado(s)</Label>
          <div className="flex flex-wrap gap-2">
            {kits.map((kit) => (
              <button
                type="button"
                key={kit.id}
                onClick={() => toggleKit(kit.id)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  selectedKitIds.includes(kit.id)
                    ? "border-purple-700 bg-purple-700 text-white"
                    : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                {kit.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <fieldset className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <legend className="px-1 text-sm font-medium text-neutral-500">SEO</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seo_title">Título SEO</Label>
          <Input id="seo_title" {...register("seo_title")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seo_description">Descripción SEO</Label>
          <Textarea id="seo_description" rows={2} {...register("seo_description")} />
        </div>
      </fieldset>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : postId ? "Guardar cambios" : "Crear publicación"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/posts")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
