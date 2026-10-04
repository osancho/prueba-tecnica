import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CartProvider } from '@/context/cart/cart-context';
import { inMemoryCartRepository } from '@/core/cart/domain/__mocks__/in-memory-cart-repository';
import { galaxy } from '@/core/product/domain/__mocks__/product-fixture';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import ProductPage, { generateMetadata } from '../page';

vi.mock('@/core/product/infrastructure/api-product-repository', () => ({
  apiProductRepository: { findById: vi.fn() },
}));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const findById = vi.mocked(apiProductRepository.findById);
const params = (id: string) => Promise.resolve({ id });

describe('ProductPage', () => {
  it('shows the not found page for an unknown phone', async () => {
    findById.mockResolvedValue(null);

    await expect(ProductPage({ params: params('NOPE') })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });

  it('describes the phone to search engines with its name and key specs', async () => {
    findById.mockResolvedValue(galaxy);

    await expect(
      generateMetadata({ params: params('SMG-S24U') }),
    ).resolves.toEqual({
      title: 'Samsung Galaxy S24 Ultra',
      description:
        'Samsung Galaxy S24 Ultra from 1229 EUR: 6.8" Dynamic AMOLED 2X screen, Snapdragon 8 Gen 3 and 5000 mAh battery. Choose your storage and color.',
    });
  });

  it.each([
    [
      'one key spec',
      { processor: undefined },
      'Samsung Galaxy S24 Ultra from 1229 EUR: 6.8" Dynamic AMOLED 2X screen and 5000 mAh battery. Choose your storage and color.',
    ],
    [
      'every key spec',
      { screen: undefined, processor: undefined, battery: undefined },
      'Samsung Galaxy S24 Ultra from 1229 EUR. Choose your storage and color.',
    ],
  ])(
    'describes a phone without %s using only what it has',
    async (_, missing, description) => {
      findById.mockResolvedValue({
        ...galaxy,
        specs: { ...galaxy.specs, ...missing },
      });

      const metadata = await generateMetadata({ params: params('SMG-S24U') });

      expect(metadata.description).toBe(description);
    },
  );

  it('has no accessibility violations', async () => {
    findById.mockResolvedValue(galaxy);

    const { container } = render(
      <CartProvider
        cartRepository={inMemoryCartRepository()}
        productRepository={{ findById: vi.fn() }}
      >
        {await ProductPage({ params: params('SMG-S24U') })}
      </CartProvider>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
