// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import robots from '../robots';

describe('robots.txt', () => {
  it('lets crawlers read the pages and the photos, but not the search proxy', () => {
    expect(robots().rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: '/api/products',
    });
  });

  it('points crawlers to the sitemap of the deployed site', () => {
    vi.stubEnv('SITE_URL', 'https://shop.test');

    expect(robots().sitemap).toBe('https://shop.test/sitemap.xml');
  });

  it('names no sitemap where the site has no public address', () => {
    vi.stubEnv('SITE_URL', '');

    expect(robots().sitemap).toBeUndefined();
  });
});
