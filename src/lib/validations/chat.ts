import { z } from "zod";

export const newThreadSchema = z.object({
  customer_name: z.string().min(2, "Ingresa tu nombre").max(120),
  customer_email: z.string().email("Ingresa un correo válido"),
  customer_phone: z.string().max(30).optional().nullable(),
  product_id: z.string().uuid().optional().nullable(),
  kit_id: z.string().uuid().optional().nullable(),
  subject: z.string().max(150).optional().nullable(),
  content: z.string().min(3, "El mensaje es muy corto").max(2000),
  // Honeypot anti-spam: si viene lleno, se descarta silenciosamente.
  website: z.string().max(0).optional(),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, "Escribe un mensaje").max(2000),
  website: z.string().max(0).optional(),
});

export type NewThreadInput = z.infer<typeof newThreadSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
