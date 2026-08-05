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
import { kitSchema, type KitInput } from "@/lib/validations/catalog";
import { slugify } from "@/lib/utils";
import type { Kit, Product } from "@/types/database.types";

type KitRow = Kit & { kit_products: { product_id: string }[] };

export default function AdminKitsPage() {
  const [kits, setKits] = useState<KitRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KitRow | null>(null);

  function load() {
    Promise.all([
      fetch("/api/admin/kits").then((res) => res.json()),
      fetch("/api/admin/products").then((res) => res.json()),
    ])
      .then(([kitsJson, productsJson]) => {
        setKits(kitsJson.data ?? []);
        setProducts(productsJson.data ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este kit?")) return;
    await fetch(`/api/admin/kits/${id}`, { method: "DELETE" });
    setKits((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Kits</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />
          Nuevo kit
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : kits.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no hay kits.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {kits.map((kit) => (
              <TableRow key={kit.id}>
                <TableCell className="font-medium">{kit.name}</TableCell>
                <TableCell>{kit.kit_products?.length ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={kit.is_active ? "success" : "secondary"}>
                    {kit.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-3 text-right">
                  <button
                    onClick={() => { setEditing(kit); setOpen(true); }}
                    className="text-purple-700 hover:underline"
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(kit.id)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <KitDialog
        key={`${open}-${editing?.id ?? "new"}`}
        open={open}
        onOpenChange={setOpen}
        kit={editing}
        products={products}
        onSaved={() => { setOpen(false); load(); }}
      />
    </div>
  );
}

function KitDialog({
  open,
  onOpenChange,
  kit,
  products,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kit: KitRow | null;
  products: Product[];
  onSaved: () => void;
}) {
  const [slugTouched, setSlugTouched] = useState(Boolean(kit));
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KitInput>({
    resolver: zodResolver(kitSchema),
    defaultValues: kit
      ? { ...kit, product_ids: kit.kit_products?.map((kp) => kp.product_id) ?? [] }
      : { name: "", slug: "", description: "", image_url: "", is_active: true, product_ids: [] },
  });

  const imageUrl = watch("image_url");
  const selectedProductIds = watch("product_ids") ?? [];

  function toggleProduct(id: string) {
    setValue(
      "product_ids",
      selectedProductIds.includes(id)
        ? selectedProductIds.filter((p) => p !== id)
        : [...selectedProductIds, id]
    );
  }

  async function onSubmit(values: KitInput) {
    setServerError(null);
    try {
      const res = await fetch(kit ? `/api/admin/kits/${kit.id}` : "/api/admin/kits", {
        method: kit ? "PATCH" : "POST",
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
          <DialogTitle>{kit ? "Editar kit" : "Nuevo kit"}</DialogTitle>
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
            <Label>Imagen</Label>
            <ImageUploader value={imageUrl} onChange={(url) => setValue("image_url", url)} />
          </div>
          {products.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Productos incluidos</Label>
              <div className="flex flex-wrap gap-2">
                {products.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      selectedProductIds.includes(product.id)
                        ? "border-purple-700 bg-purple-700 text-white"
                        : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} defaultChecked />
            Kit activo (visible al público)
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
