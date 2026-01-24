import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Настройка для работы с Backend API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/:path*',
      },
    ];
  },
  
  // Оптимизация
  reactStrictMode: true,
  
  // Настройка для production
  poweredByHeader: false,
  
  // Standalone output для Docker
  output: 'standalone',
  
  // Экспериментальные настройки
  experimental: {
    // Оптимизация для production
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
