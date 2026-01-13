import type { NextConfig } from "next";

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
};

export default nextConfig;
