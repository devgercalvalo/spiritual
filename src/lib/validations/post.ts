import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "El título es muy corto").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones"),
  excerpt: z.string().max(300).optional().nullable(),
  content: z.string().min(1, "El contenido no puede estar vacío"),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  category_id: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "published"]),
  seo_title: z.string().max(70).optional().nullable(),
  seo_description: z.string().max(160).optional().nullable(),
  kit_ids: z.array(z.string().uuid()).optional(),
});

export type PostInput = z.infer<typeof postSchema>;
