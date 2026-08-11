import type { NextConfig } from "next";

// Permite imágenes servidas desde Supabase Storage (local y, si se define,
// el proyecto cloud vía NEXT_PUBLIC_SUPABASE_URL).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

// Next.js 16 bloquea por default optimizar imágenes servidas desde una IP
// local (aunque coincida con remotePatterns) — ver "Local IP Restriction" en
// node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md. Eso
// rompe el preview de imágenes subidas en local (Supabase Storage corre en
// 127.0.0.1). Solo lo habilitamos cuando el Supabase configurado es local; un
// proyecto cloud en producción no cae aquí.
const isLocalSupabase = supabaseHostname === "127.0.0.1" || supabaseHostname === "localhost";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/**" },
      { protocol: "http", hostname: "localhost", port: "54321", pathname: "/storage/v1/object/**" },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/storage/v1/object/**" }]
        : []),
    ],
    ...(isLocalSupabase ? { dangerouslyAllowLocalIP: true } : {}),
  },
};

export default nextConfig;
