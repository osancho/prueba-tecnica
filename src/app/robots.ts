import type { MetadataRoute } from 'next';
import { siteUrl } from '@/services/server-config';

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();

  return {
    // /api/images stays open: crawlers need the product photos to render the pages.
    rules: { userAgent: '*', allow: '/', disallow: '/api/products' },
    ...(site && { sitemap: new URL('/sitemap.xml', site).href }),
  };
}
