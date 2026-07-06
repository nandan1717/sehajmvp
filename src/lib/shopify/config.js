export const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID = 
  process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || 
  process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID || '';

const rawShopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID || '';
export const SHOPIFY_SHOP_ID = 
  (rawShopId && !rawShopId.includes('myshopify.com')) ? rawShopId : '82540364031';

export const APP_URL = 
  process.env.NEXT_PUBLIC_APP_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

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
