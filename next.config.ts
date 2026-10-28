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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // No other site may show these pages in a frame (stops click-tricking a logged-in user).
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Fullscreen (tests) and payment (Razorpay) stay allowed; nothing here uses camera, mic or location.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
