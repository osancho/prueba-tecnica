import { NextResponse, type NextRequest } from 'next/server';
import { getProducts } from '@/core/product/application/get-products';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import type { ApiError } from '@/services/api-errors';

export async function GET(request: NextRequest) {
  const search =
    request.nextUrl.searchParams.get('search')?.trim() || undefined;

  try {
    return NextResponse.json(await getProducts(apiProductRepository, search));
  } catch (error) {
    console.error('Products request failed', error);
    return NextResponse.json<ApiError>(
      { error: 'BAD-GATEWAY', message: 'Products are temporarily unavailable' },
      { status: 502 },
    );
  }
}
