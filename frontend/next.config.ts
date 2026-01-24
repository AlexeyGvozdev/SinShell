import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Настройка для работы с Backend API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/:path*',
      },
    ];
  },
  
  // Оптимизация
  reactStrictMode: true,
  
  // Настройка для production
  poweredByHeader: false,
};

export default nextConfig;
