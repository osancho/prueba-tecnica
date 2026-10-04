// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import sitemap from '../sitemap';

vi.mock('@/core/product/infrastructure/api-product-repository', () => ({
  apiProductRepository: { list: vi.fn() },
}));

const list = vi.mocked(apiProductRepository.list);

function phone(id: string) {
  return { id, brand: 'Brand', name: id, basePrice: 100, imageUrl: '/p.webp' };
}

describe('sitemap.xml', () => {
  it('lists the catalog page and every phone of the catalog, not only the first 20', async () => {
    vi.stubEnv('SITE_URL', 'https://shop.test');
    list.mockResolvedValue([phone('SMG-S24U'), phone('GPX 8A')]);

    const urls = (await sitemap()).map(({ url }) => url);

    expect(list).toHaveBeenCalledWith({});
    expect(urls).toEqual([
      'https://shop.test/',
      'https://shop.test/product/SMG-S24U',
      'https://shop.test/product/GPX%208A',
    ]);
  });

  it('lists nothing, and asks the API nothing, where the site has no public address', async () => {
    vi.stubEnv('SITE_URL', '');

    await expect(sitemap()).resolves.toEqual([]);
    expect(list).not.toHaveBeenCalled();
  });
});
