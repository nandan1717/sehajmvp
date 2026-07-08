import { NextResponse } from 'next/server';

const DEFAULT_COUNTRY = 'IN';
const COUNTRY_COOKIE = 'buyer-country';

export function proxy(request) {
  // If the user already has a country cookie (from manual selection), preserve it
  const existingCountry = request.cookies.get(COUNTRY_COOKIE)?.value;

  if (existingCountry) {
    // Country already set — pass through with the country in a request header
    // so server components can read it without awaiting cookies()
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-buyer-country', existingCountry);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Detect country from Vercel geolocation header (only available on Vercel)
  const geoCountry = request.headers.get('x-vercel-ip-country');
  const detectedCountry = geoCountry || DEFAULT_COUNTRY;

  // Set the cookie and request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-buyer-country', detectedCountry);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.cookies.set(COUNTRY_COOKIE, detectedCountry, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and API routes
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
