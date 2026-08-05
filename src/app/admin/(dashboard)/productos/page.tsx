"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { productSchema, type ProductInput } from "@/lib/validations/catalog";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types/database.types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  function load() {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((json) => setProducts(json.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Productos</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no hay productos.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.price_display ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? "success" : "secondary"}>
                    {product.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-3 text-right">
                  <button
                    onClick={() => { setEditing(product); setOpen(true); }}
                    className="text-purple-700 hover:underline"
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ProductDialog
        key={`${open}-${editing?.id ?? "new"}`}
        open={open}
        onOpenChange={setOpen}
        product={editing}
        onSaved={() => { setOpen(false); load(); }}
      />
    </div>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}) {
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: "",
      slug: "",
      description: "",
      image_url: "",
      mercado_libre_url: "",
      price_display: "",
      is_active: true,
    },
  });

  const imageUrl = watch("image_url");

  async function onSubmit(values: ProductInput) {
    setServerError(null);
    try {
      const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product ? "PATCH" : "POST",
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
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
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
          <div className="flex flex-col gap-1.5">
            <Label>Precio (texto libre, ej. $199 MXN)</Label>
            <Input {...register("price_display")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Link de Mercado Libre</Label>
            <Input {...register("mercado_libre_url")} placeholder="https://articulo.mercadolibre.com.mx/…" />
            {errors.mercado_libre_url && (
              <p className="text-xs text-red-600">{errors.mercado_libre_url.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Imagen</Label>
            <ImageUploader value={imageUrl} onChange={(url) => setValue("image_url", url)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} defaultChecked />
            Producto activo (visible al público)
          </label>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
