import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Revalidate all Shopify GraphQL fetch requests tagged with 'shopify'
    revalidateTag('shopify');
    // Also revalidate all layout and page routes from root
    revalidatePath('/', 'layout');

    return NextResponse.json({
      revalidated: true,
      message: 'Shopify cache revalidated successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { revalidated: false, error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    revalidateTag('shopify');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      revalidated: true,
      message: 'Shopify cache revalidated successfully (via GET)',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { revalidated: false, error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}
