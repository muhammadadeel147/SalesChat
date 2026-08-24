import type { NextConfig } from 'next';

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:3001';
const proxyApi = Boolean(process.env.API_ORIGIN) || process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!proxyApi) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
