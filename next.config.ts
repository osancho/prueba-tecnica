import type { NextConfig } from 'next';
import { PRODUCT_IMAGE_WIDTHS } from './src/lib/product-image-loader';

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
