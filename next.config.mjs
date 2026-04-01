/** @type {import('next').NextConfig} */
const nextConfig = {
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
