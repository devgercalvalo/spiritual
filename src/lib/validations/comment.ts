import { z } from "zod";

export const commentSchema = z.object({
  post_id: z.string().uuid(),
  author_name: z.string().min(2, "Ingresa tu nombre").max(80),
  author_email: z.string().email("Ingresa un correo válido"),
  content: z.string().min(3, "El comentario es muy corto").max(2000),
  // Honeypot anti-spam: si viene lleno, se descarta silenciosamente.
  website: z.string().max(0).optional(),
});

export type CommentInput = z.infer<typeof commentSchema>;
