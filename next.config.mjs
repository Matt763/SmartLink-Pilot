/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  async rewrites() {
    return [
      {
        source: '/:sitemap(.*-sitemap.*.xml)',
        destination: '/api/sitemap/:sitemap',
      },
    ]
  }
};

export default nextConfig;
