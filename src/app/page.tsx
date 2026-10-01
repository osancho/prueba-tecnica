import type { Metadata } from 'next';
import { ProductSearch } from '@/components/ProductSearch/ProductSearch';
import { listDocumentTitle } from '@/lib/pageTitles';
import { getProducts } from '@/lib/products';

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
  if (!search) return {};

  return {
    title: { absolute: listDocumentTitle(search) },
    robots: { index: false, follow: true },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = await readSearch(searchParams);
  const products = await getProducts(search || undefined);

  return (
    <main>
      {/* Figma shows no page title; the heading still names the page for screen readers and search engines. */}
      <h1 className="visually-hidden">Smartphones</h1>
      <ProductSearch
        key={search}
        initialSearch={search}
        initialProducts={products}
      />
    </main>
  );
}
