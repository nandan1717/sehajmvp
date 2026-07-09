/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.1.131', 'localhost', '127.0.0.1'],
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