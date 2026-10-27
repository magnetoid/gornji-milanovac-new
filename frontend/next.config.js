const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: 'standalone',
  // src/instrumentation.ts starts the RSS import schedule
  experimental: { instrumentationHook: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.new.gornji-milanovac.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'directus',
      },
    ],
  },
  async rewrites() {
    return [
      // Old WordPress image URLs; migrated files keep their year/month path under UPLOAD_DIR
      {
        source: '/wp-content/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
