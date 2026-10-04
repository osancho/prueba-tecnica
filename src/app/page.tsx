import type { Metadata } from 'next';
import { ProductSearch } from '@/components/product-search/product-search';
import { getProducts } from '@/core/product/application/get-products';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import { listDocumentTitle } from '@/lib/page-titles';

interface HomePageProps {
  searchParams: Promise<{ search?: string | string[] }>;
}

async function readSearch(searchParams: HomePageProps['searchParams']) {
  const { search } = await searchParams;
  return (Array.isArray(search) ? search[0] : search)?.trim() ?? '';
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const search = await readSearch(searchParams);
  if (!search) return { alternates: { canonical: '/' } };

  return {
    title: { absolute: listDocumentTitle(search) },
    robots: { index: false, follow: true },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = await readSearch(searchParams);
  const products = await getProducts(apiProductRepository, search || undefined);

  return (
    <main>
      {/* Figma shows no page title; the heading still names the page for screen readers and search engines. */}
      <h1 className="visually-hidden">Smartphones</h1>
      {/* A new key per server render: a search typed on the page only reaches the URL through
          replaceState, so the server's `search` alone cannot tell the home link apart from it. */}
      <ProductSearch
        key={Date.now()}
        initialSearch={search}
        initialProducts={products}
      />
    </main>
  );
}
