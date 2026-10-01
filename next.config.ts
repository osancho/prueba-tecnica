import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Product images come normalized from /api/images and are smaller than every rendered
    // size, so the optimizer could only add a second lossy pass.
    unoptimized: true,
  },
};

export default nextConfig;
