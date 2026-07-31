import type { NextConfig } from "next";

/**
 * Hardened Next.js config — DESIGN_INTELLIGENCE §7 + Phase 2
 * - reactStrictMode ON (catches side-effect bugs)
 * - poweredByHeader OFF (security)
 * - compress ON
 * - AVIF + WebP image formats
 * - Mobile-first device sizes (360px → 1920px)
 * - optimizePackageImports for lucide-react + framer-motion (tree-shaking)
 * - TypeScript errors NO LONGER ignored (Phase 5 enforces zero `any`)
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 390, 414, 768, 1024, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
  allowedDevOrigins: [
    "preview-chat-*.space-z.ai",
    "*.space-z.ai",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
