import type { NextConfig } from "next";

// Permite imágenes servidas desde Supabase Storage (local y, si se define,
// el proyecto cloud vía NEXT_PUBLIC_SUPABASE_URL).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/**" },
      { protocol: "http", hostname: "localhost", port: "54321", pathname: "/storage/v1/object/**" },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/storage/v1/object/**" }]
        : []),
    ],
  },
};

export default nextConfig;
