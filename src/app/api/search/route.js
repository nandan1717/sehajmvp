import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';
import { predictiveSearchQuery } from '@/lib/shopify/queries';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    const { body } = await shopifyFetch({
      query: predictiveSearchQuery,
      variables: { query },
      cache: 'no-store'
    });

    const results = body?.data?.predictiveSearch || { products: [], collections: [] };

    return NextResponse.json({ results, success: true });
  } catch (error) {
    console.error('Error in predictive search API:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
