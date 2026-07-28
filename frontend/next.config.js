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
    return [
      {
        source: '/api/:path((?!auth).*)',
        destination: 'http://localhost:5000/api/:path',
      },
    ];
  }
}

module.exports = nextConfig
