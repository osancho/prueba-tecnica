import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BackLink } from '@/components/back_link/back_link';
import { ProductDetail } from '@/components/product_detail/product_detail';
import { ProductSpecs } from '@/components/product_specs/product_specs';
import { SimilarProducts } from '@/components/similar_products/similar_products';
import { getProduct } from '@/core/product/application/get_product';
import { lowestPrice } from '@/core/product/domain/lowest_price';
import type { Product } from '@/core/product/domain/product';
import { apiProductRepository } from '@/core/product/infrastructure/api_product_repository';
import { formatPrice } from '@/lib/format_price';
import './page.css';

// The page and its metadata both ask for the product. Next merges the two calls only when the
// response is cached; when the API fails or is waking up it would be asked, and waited for,
// twice. cache() keeps it to one call per render.
const findProduct = cache((id: string) => getProduct(apiProductRepository, id));

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function productDescription(product: Product): string {
  const { brand, name, specs } = product;
  return `${brand} ${name} from ${formatPrice(lowestPrice(product))}: ${specs.screen} screen, ${specs.processor} and ${specs.battery} battery. Choose your storage and color.`;
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
