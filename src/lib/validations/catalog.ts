import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(300).optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(1000).optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  mercado_libre_url: z.string().url("Debe ser una URL válida de Mercado Libre").optional().nullable().or(z.literal("")),
  // No usamos z.coerce: el input del formulario ya llega como number gracias a
  // `register("price", { valueAsNumber: true })`.
  price: z.number().min(0, "El precio no puede ser negativo"),
  price_display: z.string().max(40).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const kitSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(1000).optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  // No usamos z.coerce: el input del formulario ya llega como number gracias a
  // `register("price", { valueAsNumber: true })`.
  price: z.number().min(0, "El precio no puede ser negativo"),
  is_active: z.boolean().optional(),
  product_ids: z.array(z.string().uuid()).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type KitInput = z.infer<typeof kitSchema>;
