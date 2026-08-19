import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import slugifyLib from "slugify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return slugifyLib(text, { lower: true, strict: true, locale: "es" });
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

const DEFAULT_SITE_URL = "http://localhost:3000";

/**
 * URL pública del sitio, usada en metadata/SEO, sitemap.xml, og:url, etc.
 * Valida NEXT_PUBLIC_SITE_URL en vez de pasarla directo a `new URL()`: un
 * valor mal puesto en las env vars del hosting (vacío, sin protocolo, un
 * texto suelto) no debe tumbar el build entero — cae al default y ya.
 */
export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return DEFAULT_SITE_URL;
  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}
