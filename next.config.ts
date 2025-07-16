import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 🔽 Добавляем заголовки для разрешения встраивания
  async headers() {
    return [
      {
        source: '/(.*)', // применимо ко всем путям
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // ⚠️ Позволяет встраивать сайт куда угодно
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *;', // Позволяет фреймить из любого источника
          },
        ],
      },
    ];
  },
};

export default nextConfig;
