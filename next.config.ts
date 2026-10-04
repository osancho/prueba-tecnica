import type { NextConfig } from 'next';
import { PRODUCT_IMAGE_WIDTHS } from './src/lib/product-image-loader';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // No full Content-Security-Policy: Next's inline scripts would need either 'unsafe-inline',
  // which takes away its protection, or a nonce per request, which renders every page
  // dynamically and gives up the cached catalog. HSTS belongs to the HTTPS proxy.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
  images: {
    // /api/images resizes product photos as it normalizes them, so the loader asks it for one
    // of these widths and Next's optimizer, which would only add a second lossy pass, stays off.
    loader: 'custom',
    loaderFile: './src/lib/product-image-loader.ts',
    deviceSizes: PRODUCT_IMAGE_WIDTHS,
    // Next's defaults would add widths the route rejects.
    imageSizes: [],
    // No `search`: any query passes, so bumping the `?v=` cache-buster needs no config change.
    localPatterns: [{ pathname: '/api/images/*' }],
  },
};

export default nextConfig;
