import { NextResponse, type NextRequest } from 'next/server';
import { getProducts } from '@/lib/products';
import type { ApiError } from '@/types/product';

export async function GET(request: NextRequest) {
  const search =
    request.nextUrl.searchParams.get('search')?.trim() || undefined;

  try {
    return NextResponse.json(await getProducts(search));
  } catch (error) {
    console.error('Products request failed', error);
    return NextResponse.json<ApiError>(
      { error: 'BAD-GATEWAY', message: 'Products are temporarily unavailable' },
      { status: 502 },
    );
  }
}
