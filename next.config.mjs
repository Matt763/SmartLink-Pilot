/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:         { ignoreDuringBuilds: true },
  typescript:     { ignoreBuildErrors: true },
  compress:       true,
  poweredByHeader: false,

  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [375, 430, 640, 768, 1024, 1280, 1536],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 512],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      // Cloudinary — video thumbnails and optimised images
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:file(.*.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|otf))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // Dynamic typed sitemaps: post-sitemap1.xml, image-sitemap1.xml, etc.
      { source: '/:sitemap(.*-sitemap.*.xml)', destination: '/api/sitemap/:sitemap' },
      // IndexNow key file: /{32-char-hex-key}.txt → served from API route
      { source: '/:key([a-f0-9]{32}).txt', destination: '/api/indexnow' },
    ];
  },
};

export default nextConfig;
