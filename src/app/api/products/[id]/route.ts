import { NextResponse, type NextRequest } from 'next/server';
import { getProduct } from '@/core/product/application/get-product';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import type { ApiError } from '@/services/api-errors';

interface ProductRouteContext {
  params: Promise<{ id: string }>;
}

/**
 * One phone for the browser (the cart checks it is still for sale), keeping the API key here.
 * A phone that no longer exists is an expected answer, so it comes back as `null` with a 200:
 * a 404 would print an error in the console of every visitor whose cart holds it.
 */
export async function GET(
  _request: NextRequest,
  { params }: ProductRouteContext,
) {
  const { id } = await params;

  try {
    return NextResponse.json(await getProduct(apiProductRepository, id));
  } catch (error) {
    console.error('Product request failed', error);
    return NextResponse.json<ApiError>(
      {
        error: 'BAD-GATEWAY',
        message: 'The product is temporarily unavailable',
      },
      { status: 502 },
    );
  }
}
