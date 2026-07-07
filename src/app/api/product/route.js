import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';
import { getProductQuery } from '@/lib/shopify/queries';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    const { body } = await shopifyFetch({
      query: getProductQuery,
      variables: { handle },
      cache: 'no-store'
    });

    const product = body?.data?.product || null;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product, success: true });
  } catch (error) {
    console.error('Error fetching product in API:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
