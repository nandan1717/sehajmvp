/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: process.env.NODE_ENV === 'development' 
    ? ['192.168.1.131', 'localhost', '127.0.0.1'] 
    : ['localhost', '127.0.0.1'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/account',
        destination: '/profile',
        permanent: false,
      },
      {
        source: '/account/orders/:path*',
        destination: '/profile',
        permanent: false,
      },
      {
        source: '/account/addresses/:path*',
        destination: '/profile',
        permanent: false,
      },
      {
        // Redirect any other /account/... route (like /account/login or /account/logout)
        // EXCEPT /account/callback so we don't break Shopify OAuth token exchange!
        source: '/account/:path((?!callback$).*)',
        destination: '/profile',
        permanent: false,
      },
      {
        source: '/profile/orders/:path*',
        destination: '/profile',
        permanent: false,
      },
      {
        source: '/profile/addresses/:path*',
        destination: '/profile',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;