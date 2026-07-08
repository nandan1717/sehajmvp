export const SHOPIFY_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  'sehajmvp.myshopify.com';

export const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '';

// Storefront API — for products, collections, cart
export const STOREFRONT_API_URL =
  `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`;
export const STOREFRONT_PUBLIC_TOKEN = SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID =
  process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ||
  process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID || '';

export const SHOPIFY_CLIENT_ID = SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;

const rawShopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID || '';
export const SHOPIFY_SHOP_ID =
  (rawShopId && !rawShopId.includes('myshopify.com')) ? rawShopId : '82540364031';

// Customer Account API — for login, orders, profile
export const CUSTOMER_ACCOUNT_API_URL =
  `https://shopify.com/${SHOPIFY_SHOP_ID}/account/customer/api/2024-07/graphql`;

export const APP_URL =
  (typeof window !== 'undefined')
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sehajmvp.vercel.app'));

export const isShopifyConfigured =
  Boolean(SHOPIFY_STORE_DOMAIN) &&
  SHOPIFY_STORE_DOMAIN !== 'your-store.myshopify.com' &&
  Boolean(SHOPIFY_STOREFRONT_ACCESS_TOKEN) &&
  SHOPIFY_STOREFRONT_ACCESS_TOKEN !== 'your-access-token';

export const isCustomerAccountApiConfigured =
  Boolean(SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) &&
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID !== 'your_client_id_here' &&
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID !== 'your-client-id-here';

export const CART_COOKIE_NAME = 'cart-id';
export const MOCK_CART_COOKIE_NAME = 'mock-cart';

// Shopify Markets — international pricing
export const COUNTRY_COOKIE_NAME = 'buyer-country';
export const DEFAULT_COUNTRY = 'IN';

export const SUPPORTED_COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  { code: 'AE', name: 'UAE', currency: 'AED', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
];
