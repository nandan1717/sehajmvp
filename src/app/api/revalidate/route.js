import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

function isAuthorized(req) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    // If no secret configured in environment, allow revalidation in dev/local or return warning
    if (process.env.NODE_ENV === 'development') return true;
    console.warn('REVALIDATION_SECRET not set in environment.');
    return true;
  }
  const headerSecret = req.headers.get('x-revalidate-secret');
  const urlSecret = req.nextUrl?.searchParams?.get('secret');
  return headerSecret === secret || urlSecret === secret;
}

export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 });
  }

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
  if (!isAuthorized(req)) {
    return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 });
  }

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
