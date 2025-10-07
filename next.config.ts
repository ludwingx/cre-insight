import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignora errores de ESLint durante el build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignora errores de TypeScript durante el build
  },
  images: {
    domains: [
      "noticias-admin-panel.vercel.app",
      "tuto-noticias-test.vercel.app",
      "i.postimg.cc",
      "placeholder.com",
      'scontent.fgyd3-1.fna.fbcdn.net',
      'scontent.xx.fbcdn.net',
      'scontent.fbcb2-2.fna.fbcdn.net',
      'scontent-atl3-3.xx.fbcdn.net',
      'scontent-atl3-1.xx.fbcdn.net',
      'scontent-atl3-2.xx.fbcdn.net',
      'platform-lookaside.fbsbx.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
