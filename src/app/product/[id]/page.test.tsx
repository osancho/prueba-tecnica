import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CartProvider } from '@/context/cart/CartContext';
import { galaxy } from '@/components/ProductDetail/productFixture';
import { getProduct } from '@/lib/products';
import ProductPage, { generateMetadata } from './page';

vi.mock('@/lib/products', () => ({ getProduct: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const getProductMock = vi.mocked(getProduct);
const params = (id: string) => Promise.resolve({ id });

describe('ProductPage', () => {
  it('shows the not found page for an unknown phone', async () => {
    getProductMock.mockResolvedValue(null);

    await expect(ProductPage({ params: params('NOPE') })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });

  it('describes the phone to search engines with its name and key specs', async () => {
    getProductMock.mockResolvedValue(galaxy);

    await expect(
      generateMetadata({ params: params('SMG-S24U') }),
    ).resolves.toEqual({
      title: 'Samsung Galaxy S24 Ultra',
      description:
        'Samsung Galaxy S24 Ultra from 1229 EUR: 6.8" Dynamic AMOLED 2X screen, Snapdragon 8 Gen 3 and 5000 mAh battery. Choose your storage and color.',
    });
  });

  it('has no accessibility violations', async () => {
    getProductMock.mockResolvedValue(galaxy);

    const { container } = render(
      <CartProvider>
        {await ProductPage({ params: params('SMG-S24U') })}
      </CartProvider>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
