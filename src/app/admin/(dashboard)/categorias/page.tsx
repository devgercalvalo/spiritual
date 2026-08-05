"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { categorySchema, type CategoryInput } from "@/lib/validations/catalog";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/database.types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  function load() {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => setCategories(json.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría? Las publicaciones asociadas quedarán sin categoría.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Categorías</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no hay categorías.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-neutral-500">{category.slug}</TableCell>
                <TableCell className="max-w-xs truncate text-neutral-500">{category.description}</TableCell>
                <TableCell className="flex justify-end gap-3 text-right">
                  <button
                    onClick={() => { setEditing(category); setOpen(true); }}
                    className="text-purple-700 hover:underline"
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CategoryDialog
        key={`${open}-${editing?.id ?? "new"}`}
        open={open}
        onOpenChange={setOpen}
        category={editing}
        onSaved={() => { setOpen(false); load(); }}
      />
    </div>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSaved: () => void;
}) {
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ?? { name: "", slug: "", description: "" },
  });

  async function onSubmit(values: CategoryInput) {
    setServerError(null);
    try {
      const res = await fetch(category ? `/api/admin/categories/${category.id}` : "/api/admin/categories", {
        method: category ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "No se pudo guardar");
      }
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo guardar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nombre</Label>
            <Input
              {...register("name", {
                onChange: (e) => {
                  if (!slugTouched) setValue("slug", slugify(e.target.value));
                },
              })}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Slug</Label>
            <Input {...register("slug", { onChange: () => setSlugTouched(true) })} />
            {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Descripción</Label>
            <Textarea rows={3} {...register("description")} />
          </div>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
