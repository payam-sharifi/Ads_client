import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development for faster compilation
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:locale(en|de|fa)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        source: '/:locale(en|de|fa)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/support', destination: '/contact', permanent: true },
      { source: '/:locale/support', destination: '/:locale/contact', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'apimytodos.appventuregmbh.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'apimytodos.appventuregmbh.com',
        port: '',
        pathname: '/**',
      },
      // Cloudflare R2 (public bucket URLs - add your custom domain if using one)
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
    // Disable image optimization in production to prevent RAM issues
    // Images will be served directly from the source
    unoptimized: true,
  },
  turbopack: {},
};

export default withNextIntl(withPWA(nextConfig));
