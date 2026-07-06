export const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const isShopifyConfigured =
  Boolean(SHOPIFY_STORE_DOMAIN) &&
  SHOPIFY_STORE_DOMAIN !== 'your-store.myshopify.com' &&
  Boolean(SHOPIFY_STOREFRONT_ACCESS_TOKEN) &&
  SHOPIFY_STOREFRONT_ACCESS_TOKEN !== 'your-access-token';

export const CART_COOKIE_NAME = 'cart-id';
export const MOCK_CART_COOKIE_NAME = 'mock-cart';
