import type { MetadataRoute } from 'next';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import { siteUrl } from '@/services/server-config';

// Built on request: the catalog belongs to an API that changes on its own, and a build
// (CI included) must not need it.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  // A sitemap lists absolute URLs: without a public address there is nothing to list.
  if (!site) return [];

  // The whole catalog, not only the first phones of the list.
  const phones = await apiProductRepository.list({});
  return [
    { url: new URL('/', site).href },
    ...phones.map(({ id }) => ({
      url: new URL(`/product/${encodeURIComponent(id)}`, site).href,
    })),
  ];
}
