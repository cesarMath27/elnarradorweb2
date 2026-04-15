import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "elnarradordemexico.com" },
      { protocol: "https", hostname: "*.elnarradordemexico.com" },
      { protocol: "https", hostname: "fewwvcrfhdgnpfjyadev.supabase.co" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  experimental: {
    // Permite subir archivos grandes (PDFs) desde server actions.
    // Por defecto Next.js limita el body a 1 MB, lo que bloquea cualquier PDF > 1 MB.
    serverActionsBodySizeLimit: "52mb",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;