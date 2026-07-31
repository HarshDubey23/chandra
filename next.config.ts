import type { NextConfig } from "next";

/**
 * Hardened Next.js config — DESIGN_INTELLIGENCE §7 + Phase 2 + Round 3 security
 * - reactStrictMode ON (catches side-effect bugs)
 * - poweredByHeader OFF (security)
 * - compress ON
 * - AVIF + WebP image formats
 * - Mobile-first device sizes (360px → 1920px)
 * - optimizePackageImports for lucide-react + framer-motion (tree-shaking)
 * - TypeScript errors NO LONGER ignored (Phase 5 enforces zero `any`)
 * - Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
 */
const securityHeaders = [
  // CSP — restrict resource loading to self + approved sources
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self'",
      "connect-src 'self' https://api.vapi.ai https://general.vapi.ai wss://general.vapi.ai",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Disable Flash/PDF embedding
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  allowedDevOrigins: [
    "preview-chat-*.space-z.ai",
    "*.space-z.ai",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
