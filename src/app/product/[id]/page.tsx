import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackLink } from '@/components/BackLink/BackLink';
import { ProductDetail } from '@/components/ProductDetail/ProductDetail';
import { ProductSpecs } from '@/components/ProductSpecs/ProductSpecs';
import { SimilarProducts } from '@/components/SimilarProducts/SimilarProducts';
import { formatPrice } from '@/lib/formatPrice';
import { lowestPrice } from '@/lib/lowestPrice';
import { getProduct } from '@/lib/products';
import type { Product } from '@/types/product';
import './page.css';

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
  const product = await getProduct((await params).id);
  if (!product) return { title: 'Smartphone not found' };

  return {
    title: `${product.brand} ${product.name}`,
    description: productDescription(product),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct((await params).id);
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
