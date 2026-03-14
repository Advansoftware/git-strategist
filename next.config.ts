import type {NextConfig} from 'next';

// Forçando reinicialização para carregar o .env
const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Adicionado para forçar a reinicialização e carregar o .env
    RESTART_TRIGGER: new Date().toISOString(),
  },
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
