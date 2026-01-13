import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development for faster compilation
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  swMinify: true,
  fallbackToCacheWaitTime: 500,
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/support',
        destination: '/contact',
        permanent: true,
      },
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
    ],
    // Disable image optimization in production to prevent RAM issues
    // Images will be served directly from the source
    unoptimized: true,
  },
  turbopack: {},
};

export default withPWA(nextConfig);
