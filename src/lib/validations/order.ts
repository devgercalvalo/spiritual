import { z } from "zod";

export const orderItemInputSchema = z.object({
  item_type: z.enum(["product", "kit"]),
  id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Ingresa tu nombre").max(120),
  customer_email: z.string().email("Ingresa un correo válido"),
  customer_phone: z.string().max(30).optional().nullable(),
  customer_notes: z.string().max(1000).optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, "El carrito está vacío"),
  // Honeypot anti-spam: si viene lleno, se descarta silenciosamente.
  website: z.string().max(0).optional(),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
