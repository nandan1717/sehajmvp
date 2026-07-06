import { mockProducts, mockCollections } from './mockData';
import { isShopifyConfigured, STOREFRONT_API_URL, STOREFRONT_PUBLIC_TOKEN } from './config';
import {
  parseMockCart,
  createEmptyMockCart,
  addToMockCart,
  updateMockCartLine,
  removeMockCartLine,
} from './mockCart';

export async function shopifyFetch({ query, variables, cache = 'default' }) {
  if (!isShopifyConfigured) {
    return handleMockRequest(query, variables);
  }

  const endpoint = STOREFRONT_API_URL;
  const storefrontAccessToken = STOREFRONT_PUBLIC_TOKEN;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  };

  if (cache === 'no-store') {
    fetchOptions.cache = 'no-store';
  } else {
    fetchOptions.next = { revalidate: 3600 };
  }

  try {
    const result = await fetch(endpoint, fetchOptions);
    const body = await result.json();

    if (body.errors) {
      console.error('GraphQL Errors:', body.errors);
      throw new Error(body.errors[0]?.message || 'GraphQL request failed');
    }

    return { status: result.status, body };
  } catch (error) {
    console.error('Error in shopifyFetch:', error);
    console.warn('Falling back to mock data due to Shopify API error.');
    return handleMockRequest(query, variables);
  }
}

function handleMockRequest(query, variables) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = {};

      if (query.includes('getProducts') || query.includes('products(first:')) {
        data = { products: { edges: mockProducts.map((node) => ({ node })) } };
      } else if (query.includes('getProduct') && variables?.handle) {
        const product = mockProducts.find((p) => p.handle === variables.handle);
        data = { product: product || null };
      } else if (query.includes('getCollection') && variables?.handle) {
        if (variables.handle === 'all') {
          data = {
            collection: {
              id: 'gid://shopify/Collection/all',
              handle: 'all',
              title: 'All Products',
              description: 'Browse our complete collection of Indian wear.',
              products: { edges: mockProducts.map((node) => ({ node })) },
            },
          };
        } else if (variables.handle === 'bestsellers') {
          data = {
            collection: {
              id: 'gid://shopify/Collection/bestsellers',
              handle: 'bestsellers',
              title: 'Bestsellers',
              description: 'Our most loved pieces, curated for you.',
              products: { edges: mockProducts.slice(0, 3).map((node) => ({ node })) },
            },
          };
        } else {
          const collection = mockCollections.find((c) => c.handle === variables.handle);
          data = { collection: collection || null };
        }
      } else if (query.includes('getCollections') || query.includes('collections(first:')) {
        data = { collections: { edges: mockCollections.map((node) => ({ node })) } };
      } else if (query.includes('getCart') || query.includes('cart(id:')) {
        data = { cart: createEmptyMockCart() };
      } else if (query.includes('cartCreate')) {
        const lines = variables?.input?.lines || [];
        let cart = createEmptyMockCart();
        for (const line of lines) {
          const result = addToMockCart(cart, line.merchandiseId, line.quantity);
          cart = result.cart;
        }
        data = { cartCreate: { cart, userErrors: [] } };
      } else if (query.includes('cartLinesAdd')) {
        let cart = createEmptyMockCart();
        const lines = variables?.lines || [];
        for (const line of lines) {
          const result = addToMockCart(cart, line.merchandiseId, line.quantity);
          cart = result.cart;
        }
        data = { cartLinesAdd: { cart, userErrors: [] } };
      } else if (query.includes('cartLinesUpdate')) {
        let cart = createEmptyMockCart();
        const line = variables?.lines?.[0];
        if (line) {
          const result = updateMockCartLine(cart, line.id, line.quantity);
          cart = result.cart;
        }
        data = { cartLinesUpdate: { cart, userErrors: [] } };
      } else if (query.includes('cartLinesRemove')) {
        data = { cartLinesRemove: { cart: createEmptyMockCart(), userErrors: [] } };
      }

      resolve({ status: 200, body: { data } });
    }, 300);
  });
}

export { isShopifyConfigured };
