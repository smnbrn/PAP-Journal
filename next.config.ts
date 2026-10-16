import type { NextConfig } from "next";

// Le immagini caricate dalla redazione su Supabase Storage o Vercel Blob vengono ottimizzate
// automaticamente (formati moderni, dimensioni adatte a ogni schermo).
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Il browser deve sapere se i file vanno su Vercel Blob: la variabile del token esiste solo sul server.
  env: {
    NEXT_PUBLIC_BLOB_UPLOADS: process.env.BLOB_READ_WRITE_TOKEN ? "1" : "",
    // ID di misurazione di Google Analytics (pubblico per natura). Si può sostituire con la variabile
    // NEXT_PUBLIC_GA_ID; per spegnere le statistiche basta impostarla vuota («NEXT_PUBLIC_GA_ID=»).
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID ?? "G-CKG3X7QRW6",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      // Immagini caricate su Vercel Blob (archivio pubblico).
      { protocol: "https" as const, hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/redazione/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
