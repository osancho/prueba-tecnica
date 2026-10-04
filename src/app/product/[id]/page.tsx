import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BackLink } from '@/components/back-link/back-link';
import { ProductDetail } from '@/components/product-detail/product-detail';
import { ProductSpecs } from '@/components/product-specs/product-specs';
import { SimilarProducts } from '@/components/similar-products/similar-products';
import { lowestPrice } from '@/core/product/domain/lowest-price';
import type { Product } from '@/core/product/domain/product';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import { formatPrice } from '@/lib/format-price';
import './page.css';

// The page and its metadata both ask for the product. Next merges the two calls only when the
// response is cached; when the API fails or is waking up it would be asked, and waited for,
// twice. cache() keeps it to one call per render.
const findProduct = cache((id: string) => apiProductRepository.findById(id));

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// en-GB joins the last item without a serial comma ("A, B and C").
const highlightList = new Intl.ListFormat('en-GB', { type: 'conjunction' });

function productDescription(product: Product): string {
  const { brand, name, specs } = product;
  const highlights = [
    specs.screen && `${specs.screen} screen`,
    specs.processor,
    specs.battery && `${specs.battery} battery`,
  ].filter((highlight): highlight is string => Boolean(highlight));
  const summary =
    highlights.length > 0 ? `: ${highlightList.format(highlights)}` : '';
  return `${brand} ${name} from ${formatPrice(lowestPrice(product))}${summary}. Choose your storage and color.`;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await findProduct((await params).id);
  if (!product) return { title: 'Smartphone not found' };

  return {
    title: `${product.brand} ${product.name}`,
    description: productDescription(product),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await findProduct((await params).id);
  if (!product) notFound();

  return (
    <>
      <BackLink />
      <main className="product-page">
        <ProductDetail product={product} />
        <ProductSpecs product={product} />
        <SimilarProducts products={product.similarProducts} />
      </main>
    </>
  );
}
