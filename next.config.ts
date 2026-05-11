import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════
  // ⚡ BUILD
  // ═══════════════════════════════════════════════════════════
  serverExternalPackages: ['better-sqlite3', 'node-llama-cpp'],
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  // ═══════════════════════════════════════════════════════════
  // 🔒 SECURITY + PERFORMANCE HEADERS
  // ═══════════════════════════════════════════════════════════
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent framing (clickjacking) but allow internal embeds
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // XSS filter
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // DNS prefetch
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Permissions Policy — disable unnecessary browser features
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
      {
        // No caching for API routes
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      {
        // Cache static assets for 1 year (fonts, images served by Next.js)
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      ...(process.env.NODE_ENV === 'production' ? [{
        // Cache Next.js static chunks for 1 year (production only)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      }] : []),
    ];
  },

  // ═══════════════════════════════════════════════════════════
  // 🌐 REDIRECT
  // ═══════════════════════════════════════════════════════════
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.cybershield.academy' }],
        destination: 'https://cybershield.academy/:path*',
        permanent: true,
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════
  // ⚡ PERFORMANCE
  // ═══════════════════════════════════════════════════════════
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'cybershield.academy' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🚀 EXPERIMENTAL
  // ═══════════════════════════════════════════════════════════
  experimental: {
    optimizePackageImports: ['zod', 'jose', 'otplib', '@google/generative-ai'],
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

export default nextConfig;
