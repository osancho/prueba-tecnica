import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { getProducts } from '@/core/product/application/get_products';
import { apiProductRepository } from '@/core/product/infrastructure/api_product_repository';
import HomePage, { generateMetadata } from './page';

vi.mock('@/core/product/application/get_products', () => ({
  getProducts: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams({ search: 'samsung' }),
}));

const getProductsMock = vi.mocked(getProducts);

function searchParams(search?: string) {
  return Promise.resolve(search === undefined ? {} : { search });
}

describe('HomePage', () => {
  it('opens a shared search link with its results already listed', async () => {
    getProductsMock.mockResolvedValue([
      {
        id: 'SMG-S24U',
        brand: 'Samsung',
        name: 'Galaxy S24 Ultra',
        basePrice: 1329,
        imageUrl: '/api/images/SMG-S24U.webp',
      },
    ]);

    render(await HomePage({ searchParams: searchParams(' samsung ') }));

    expect(getProductsMock).toHaveBeenCalledWith(
      apiProductRepository,
      'samsung',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Smartphones' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('samsung');
    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  it('keeps search result pages out of search engine indexes', async () => {
    await expect(
      generateMetadata({ searchParams: searchParams('samsung') }),
    ).resolves.toMatchObject({
      title: { absolute: 'Results for “samsung” | MBST' },
      robots: { index: false, follow: true },
    });
    await expect(
      generateMetadata({ searchParams: searchParams() }),
    ).resolves.toEqual({});
  });

  it('has no accessibility violations', async () => {
    getProductsMock.mockResolvedValue([
      {
        id: 'SMG-S24U',
        brand: 'Samsung',
        name: 'Galaxy S24 Ultra',
        basePrice: 1329,
        imageUrl: '/api/images/SMG-S24U.webp',
      },
    ]);

    const { container } = render(
      await HomePage({ searchParams: searchParams() }),
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
