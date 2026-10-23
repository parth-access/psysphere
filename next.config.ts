import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Dravina's photo (constants/testimonials.ts) is served from the main Saarthi site
    remotePatterns: [{ protocol: 'https', hostname: 'www.saarthilife.com', pathname: '/**' }],
  },
  transpilePackages: ['motion'],
  experimental: {
    // Study material uploads go through a server action
    serverActions: { bodySizeLimit: '25mb' },
  },
};

export default nextConfig;
