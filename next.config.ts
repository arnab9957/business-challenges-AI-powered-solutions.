import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
  // This is to allow cross-origin requests from the development environment (e.g. Firebase Studio).
  experimental: {
    // Keep other experimental features here if needed.
  },
  allowedDevOrigins: ['**.cloudworkstations.dev'],
};

export default nextConfig;
