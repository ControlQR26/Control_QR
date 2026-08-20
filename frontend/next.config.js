/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  images: {
    domains: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  },
  async rewrites() {
    let backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    backendUrl = backendUrl.replace(/\/+$/, '');
    if (!backendUrl.endsWith('/api')) {
      backendUrl = `${backendUrl}/api`;
    }
    return [
      {
        source: '/api/:path((?!auth).*)',
        destination: `${backendUrl}/:path`,
      },
    ];
  }
}

module.exports = nextConfig
