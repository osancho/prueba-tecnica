'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/context/cart/cart-context';
import { localStorageCartRepository } from '@/core/cart/infrastructure/local-storage-cart-repository';
import { httpProductRepository } from '@/core/product/infrastructure/http-product-repository';

/**
 * The browser's composition root: the one client module that names the browser adapters.
 * The layout is a server component and cannot hand objects with functions to a client one.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider
      cartRepository={localStorageCartRepository}
      productRepository={httpProductRepository}
    >
      {children}
    </CartProvider>
  );
}
